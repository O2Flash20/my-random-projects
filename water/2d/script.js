import densityGradientCode from "./shaders/densityGradient.wgsl.js"
import dropCode from "./shaders/drop.wgsl.js"
import shiftCode from "./shaders/shiftDensity.wgsl.js"
import blurCode from "./shaders/blur.wgsl.js"
import displayCode from "./shaders/displayTexture.wgsl.js"
import renderCode from "./shaders/render.wgsl.js"

let clickPos = { x: null, y: null }
let frontBuffer = null
let backBuffer = null

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    const canvas = document.getElementById("mainCanvas")
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })
    canvas.addEventListener("click", function (event) {
        const boundingRect = canvas.getBoundingClientRect()
        const clickPosX = event.clientX - boundingRect.left
        const clickPosY = event.clientY - boundingRect.top
        clickPos = { x: clickPosX, y: clickPosY }
    })

    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    const nearestSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "nearest",
        minFilter: "nearest",
        mipmapFilter: "nearest",
    })

    // ------------------defining the textures------------------
    const densityTextureA = device.createTexture({
        label: "texture A for holding the water density",
        format: "r32float",
        dimension: "2d",
        size: [canvas.clientWidth, canvas.clientHeight],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING
    })

    const densityTextureB = device.createTexture({
        label: "texture A for holding the water density",
        format: "r32float",
        dimension: "2d",
        size: [canvas.clientWidth, canvas.clientHeight],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING
    })

    frontBuffer = densityTextureA
    backBuffer = densityTextureB

    const gradientTexture = device.createTexture({
        label: "texture holding the density gradient",
        format: "rg32float",
        dimension: "2d",
        size: [canvas.clientWidth, canvas.clientHeight],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING //!texture binding for debugging
    })

    const displayTexture = device.createTexture({
        label: "texture for displaying the density, a copy of either A or B",
        format: "rgba8unorm",
        dimension: "2d",
        size: [canvas.clientWidth, canvas.clientHeight],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })
    // ------------------------------------------------------

    // interacting with the water
    const dropModule = device.createShaderModule({
        label: "adding drop compute module",
        code: dropCode
    })
    const dropPipeline = device.createComputePipeline({
        label: "adding drop compute pipeline",
        layout: "auto",
        compute: {
            module: dropModule
        }
    })

    // getting the density gradient of the water
    const gradientModule = device.createShaderModule({
        label: "density gradient compute module",
        code: densityGradientCode
    })
    const gradientPipeline = device.createComputePipeline({
        label: "density gradient compute pipeline",
        layout: "auto",
        compute: {
            module: gradientModule
        }
    })

    // shifts the water based on the gradient
    const shiftModule = device.createShaderModule({
        label: "shift density compute module",
        code: shiftCode
    })
    const shiftPipeline = device.createComputePipeline({
        label: "shift density compute pipeline",
        layout: "auto",
        compute: {
            module: shiftModule
        }
    })

    // blurring the density to prevent pixels from clumping
    const blurModule = device.createShaderModule({
        label: "blur density compute module",
        code: blurCode
    })
    const blurPipeline = device.createComputePipeline({
        label: "blur density compute pipeline",
        layout: "auto",
        compute: {
            module: blurModule
        }
    })

    // compute shader to turn the density buffer into something renderable
    const displayModule = device.createShaderModule({
        label: "display creator shaders",
        code: displayCode
    })
    const displayPipeline = device.createComputePipeline({
        label: "display creator pipeline",
        layout: "auto",
        compute: {
            module: displayModule
        }
    })

    // renders the water to the gradient
    const renderModule = device.createShaderModule({
        label: "rendering shaders",
        code: renderCode
    })
    const renderPipeline = device.createRenderPipeline({
        label: "rendering pipeline",
        layout: "auto",
        vertex: {
            module: renderModule
        },
        fragment: {
            module: renderModule,
            targets: [{ format: presentationFormat }]
        }
    })
    const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: displayTexture.createView() },
            { binding: 1, resource: linearSampler }
        ]
    })
    const renderPassDescriptor = {
        label: "render pass",
        colorAttachments: [{
            // view <- to be filled in
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear",
            storeOp: "store"
        }]
    }

    let i = 0
    function render(time) {
        i++
        if (i % 1 == 0) { // to slow it down

            // if clicked, add a drop to the density
            if (clickPos.x && clickPos.y) {
                addDrop(clickPos.x, clickPos.y, 100, 100, 0.1, frontBuffer, backBuffer, dropPipeline, device, canvas)
                clickPos = { x: null, y: null }
            }

            // get a texture with the density gradient
            computeDensityGradient(frontBuffer, gradientTexture, gradientPipeline, device, canvas)

            // shift the density according to the gradient
            shiftDensity(frontBuffer, backBuffer, gradientTexture, shiftPipeline, device, canvas)

            // blur the density to get the pixels to not clump
            blurDensity(3, frontBuffer, backBuffer, blurPipeline, device, canvas)

            // get a texture that can be displayed
            createDisplayTexture(frontBuffer, displayTexture, displayPipeline, device, canvas) //to see the density
            // createDisplayTexture(gradientTexture, displayTexture, displayPipeline, device, canvas) //to see the gradient, make a change in the shader code too

            // display that texture
            renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()
            const renderEncoder = device.createCommandEncoder({
                label: "render encoder"
            })
            const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor)
            renderPass.setPipeline(renderPipeline)
            renderPass.setBindGroup(0, renderBindGroup)
            renderPass.draw(6)
            renderPass.end()
            const commandBuffer = renderEncoder.finish()
            device.queue.submit([commandBuffer])


        }

        // start a new frame
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target
            const width = entry.contentBoxSize[0].inlineSize
            const height = entry.contentBoxSize[0].blockSize
            canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D))
            canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D))
        }
    })
    observer.observe(canvas)
}
main()

// takes the front buffer as input, edits the back buffer, then copies the back to the front
function addDrop(x, y, strength, size, upDownRatio, frontBuffer, backBuffer, dropPipeline, device, canvas) {
    const dropInfoBuffer = device.createBuffer({
        size: 24,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const dropInfoValues = new ArrayBuffer(24)
    const dropInfoViews = {
        position: new Uint32Array(dropInfoValues, 0, 2),
        strength: new Float32Array(dropInfoValues, 8, 1),
        size: new Float32Array(dropInfoValues, 12, 1),
        upDownRatio: new Float32Array(dropInfoValues, 16, 1),
    }
    dropInfoViews.position[0] = x
    dropInfoViews.position[1] = y
    dropInfoViews.strength[0] = strength
    dropInfoViews.size[0] = size
    dropInfoViews.upDownRatio[0] = upDownRatio
    device.queue.writeBuffer(dropInfoBuffer, 0, dropInfoValues)

    const dropBindGroup = device.createBindGroup({
        label: "adding drop bind group",
        layout: dropPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: dropInfoBuffer } },
            { binding: 1, resource: frontBuffer.createView() },
            { binding: 2, resource: backBuffer.createView() }
        ]
    })

    const dropEncoder = device.createCommandEncoder({
        label: "adding drop command encoder"
    })

    const dropPass = dropEncoder.beginComputePass({
        label: "adding drop compute pass"
    })
    dropPass.setPipeline(dropPipeline)
    dropPass.setBindGroup(0, dropBindGroup)
    dropPass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
    dropPass.end()

    dropEncoder.copyTextureToTexture(
        { texture: backBuffer },
        { texture: frontBuffer },
        [canvas.clientWidth, canvas.clientHeight]
    )

    const commandBuffer = dropEncoder.finish()
    device.queue.submit([commandBuffer])
}

function computeDensityGradient(densityTexture, gradientTexture, gradientPipeline, device, canvas) {
    const gradientBindGroup = device.createBindGroup({
        label: "bind group for taking the gradient of density",
        layout: gradientPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: densityTexture.createView() },
            { binding: 1, resource: gradientTexture.createView() }
        ]
    })

    const gradientEncoder = device.createCommandEncoder({
        label: "density gradient command encoder"
    })

    const gradientPass = gradientEncoder.beginComputePass({
        label: "density gradient compute pass"
    })
    gradientPass.setPipeline(gradientPipeline)
    gradientPass.setBindGroup(0, gradientBindGroup)
    gradientPass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
    gradientPass.end()

    const commandBuffer = gradientEncoder.finish()
    device.queue.submit([commandBuffer])
}

function shiftDensity(frontBuffer, backBuffer, gradientTexture, shiftPipeline, device, canvas) {
    const shiftBindGroup = device.createBindGroup({
        label: "shift density bind group",
        layout: shiftPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: frontBuffer.createView() },
            { binding: 1, resource: backBuffer.createView() },
            { binding: 2, resource: gradientTexture.createView() },
        ]
    })

    const shiftEncoder = device.createCommandEncoder({
        label: "shift density command encoder"
    })

    const shiftPass = shiftEncoder.beginComputePass({
        label: "shift density compute pass"
    })
    shiftPass.setPipeline(shiftPipeline)
    shiftPass.setBindGroup(0, shiftBindGroup)
    shiftPass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
    shiftPass.end()

    shiftEncoder.copyTextureToTexture(
        { texture: backBuffer },
        { texture: frontBuffer },
        [canvas.clientWidth, canvas.clientHeight]
    )

    const commandBuffer = shiftEncoder.finish()
    device.queue.submit([commandBuffer])
}

function blurDensity(amount, frontBuffer, backBuffer, blurPipeline, device, canvas) {
    const blurBindGroup = device.createBindGroup({
        label: "blur density bind group",
        layout: blurPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: frontBuffer.createView() },
            { binding: 1, resource: backBuffer.createView() }
        ]
    })

    const blurEncoder = device.createCommandEncoder({
        label: "blur density command encoder"
    })

    const blurPass = blurEncoder.beginComputePass({
        label: "blur density compute pass"
    })
    blurPass.setPipeline(blurPipeline)
    blurPass.setBindGroup(0, blurBindGroup)
    blurPass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
    blurPass.end()

    blurEncoder.copyTextureToTexture(
        { texture: backBuffer },
        { texture: frontBuffer },
        [canvas.clientWidth, canvas.clientHeight]
    )

    const commandBuffer = blurEncoder.finish()
    device.queue.submit([commandBuffer])
}

function createDisplayTexture(densityTexture, displayTexture, displayPipeline, device, canvas) {
    const displayBindGroup = device.createBindGroup({
        label: "display creator bind group",
        layout: displayPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: densityTexture.createView() },
            { binding: 1, resource: displayTexture.createView() }
        ]
    })

    const displayEncoder = device.createCommandEncoder({
        label: "display creator command encoder"
    })

    const displayPass = displayEncoder.beginComputePass({
        label: "display creator compute pass"
    })
    displayPass.setPipeline(displayPipeline)
    displayPass.setBindGroup(0, displayBindGroup)
    displayPass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
    displayPass.end()

    const commandBuffer = displayEncoder.finish()
    device.queue.submit([commandBuffer])
}