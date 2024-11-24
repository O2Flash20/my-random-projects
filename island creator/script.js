const imageSize = 512

import drawCode from "./shaders/draw.wgsl.js"
import edgeDetectCode from "./shaders/edgeDetect.wgsl.js"
import jumpFloodCode from "./shaders/jumpFlood.wgsl.js"
import distanceCode from "./shaders/distance.wgsl.js"
import surfaceNormalCode from "./shaders/surfaceNormal.wgsl.js"
import colorCode from "./shaders/color.wgsl.js"
import renderCode from "./shaders/render.wgsl.js"

let brushSize = 15
document.getElementById("brushSizeInput").addEventListener("change", function () {
    const v = document.getElementById("brushSizeInput").value
    document.getElementById("brushSizeDisplay").innerText = v
    brushSize = v
})

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    // set up the canvas
    const canvas = document.getElementById("mainCanvas")
    canvas.width = imageSize
    canvas.height = imageSize
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    let mouseIsDown = false
    let altKey = 0
    canvas.addEventListener("mousedown", function (event) { mouseIsDown = true; altKey = 1 ? event.altKey : 0 })
    canvas.addEventListener("mouseup", function (event) { mouseIsDown = false; altKey = 1 ? event.altKey : 0 })
    let cursorPos = { x: 0, y: 0 }
    document.addEventListener("mousemove", function (e) {
        const canvasBounds = canvas.getBoundingClientRect()
        cursorPos = {
            x: e.clientX - canvasBounds.left,
            y: e.clientY - canvasBounds.top
        }
    })

    const linearSampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear"
    })



    const drawModule = device.createShaderModule({
        label: "drawing module",
        code: drawCode.replace("_IS", imageSize)
    })

    const drawPipeline = device.createComputePipeline({
        label: "drawing pipeline",
        layout: "auto",
        compute: {
            module: drawModule
        }
    })

    const drawTexture = device.createTexture({
        label: "a texture holding the drawn shape, should only be filled with 0 or 1",
        format: "r32uint",
        dimension: "2d",
        size: [imageSize, imageSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const drawUniformsBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const drawUniformsValues = new ArrayBuffer(16)
    const drawUniformsViews = {
        drawMode: new Uint32Array(drawUniformsValues, 0, 1),
        drawSize: new Float32Array(drawUniformsValues, 4, 1),
        clickPos: new Uint32Array(drawUniformsValues, 8, 2),
    }

    const drawBindGroup = device.createBindGroup({
        layout: drawPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: drawUniformsBuffer } },
            { binding: 1, resource: drawTexture.createView() }
        ]
    })



    // textures that contain pixels whose color is the nearest seed point (edge point) or whatever the current state of the jump flooding is
    const jfTextures = [
        device.createTexture({
            label: "jump flood texture 0",
            format: "rg32uint",
            dimension: "2d",
            size: [imageSize, imageSize],
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
        }),
        device.createTexture({
            label: "jump flood texture 1",
            format: "rg32uint",
            dimension: "2d",
            size: [imageSize, imageSize],
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
        }),
    ]



    const edgeDetectModule = device.createShaderModule({
        label: "edge detect module",
        code: edgeDetectCode.replace("_IS", imageSize)
    })

    const edgeDetectPipeline = device.createComputePipeline({
        label: "edge detect pipeline",
        layout: "auto",
        compute: {
            module: edgeDetectModule
        }
    })

    const edgeDetectBindGroup = device.createBindGroup({
        layout: edgeDetectPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: drawTexture.createView() },
            { binding: 1, resource: jfTextures[0].createView() }
        ]
    })



    // create the shader module
    const jumpFloodModule = device.createShaderModule({
        label: "jump flooding module",
        code: jumpFloodCode.replace("_IS", imageSize)
    })

    const jumpFloodPipeline = device.createComputePipeline({
        label: "jump flooding pipeline",
        layout: "auto",
        compute: {
            module: jumpFloodModule
        }
    })

    const jfUniformsBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const jfUniformsValues = new ArrayBuffer(4)
    const jfUniformsViews = {
        stepSize: new Uint32Array(jfUniformsValues),
    }
    // bind group set in render



    const distanceModule = device.createShaderModule({
        label: "distance calculation module",
        code: distanceCode.replace("_IS", imageSize)
    })

    const distancePipeline = device.createComputePipeline({
        label: "distance pipeline",
        layout: "auto",
        compute: { module: distanceModule }
    })

    const distanceTexture = device.createTexture({
        label: "a texture holding the signed distance of each pixel to the shape",
        format: "r32float",
        dimension: "2d",
        size: [imageSize, imageSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const distanceBindGroup = device.createBindGroup({
        layout: distancePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: jfTextures[(Math.log2(imageSize)) % 2].createView() }, //the final jump flooding texture
            { binding: 1, resource: drawTexture.createView() },
            { binding: 2, resource: distanceTexture.createView() }
        ]
    })



    const timeBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const timeValue = new Float32Array(1)



    const normalModule = device.createShaderModule({
        label: "distances to surface normal module",
        code: surfaceNormalCode
    })

    const normalPipeline = device.createComputePipeline({
        label: "distances to surface normal pipeline",
        layout: "auto",
        compute: { module: normalModule }
    })

    const normalTexture = device.createTexture({
        label: "texture storing normals for the terrain",
        format: "rg32float",
        size: [imageSize, imageSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const normalBindGroup = device.createBindGroup({
        layout: normalPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: distanceTexture.createView() },
            { binding: 1, resource: { buffer: timeBuffer } },
            { binding: 2, resource: normalTexture.createView() }
        ]
    })



    const colorModule = device.createShaderModule({
        label: "convert distances to rgba module",
        code: colorCode.replace("_IS", imageSize)
    })

    const colorPipeline = device.createComputePipeline({
        label: "convert distances to rgba pipeline",
        layout: "auto",
        compute: { module: colorModule }
    })

    const colorTexture = device.createTexture({
        label: "a full-color texture representing the distances",
        format: "rgba8unorm",
        dimension: "2d",
        size: [imageSize, imageSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const colorBindGroup = device.createBindGroup({
        layout: colorPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: distanceTexture.createView() },
            { binding: 1, resource: normalTexture.createView() },
            { binding: 2, resource: { buffer: timeBuffer } },
            { binding: 3, resource: colorTexture.createView() }
        ]
    })



    const renderModule = device.createShaderModule({
        label: "render module",
        code: renderCode.replace("_IS", imageSize)
    })

    const renderPipeline = device.createRenderPipeline({
        label: "render pipeline",
        layout: "auto",
        vertex: { module: renderModule },
        fragment: {
            module: renderModule,
            targets: [{ format: presentationFormat }]
        }
    })

    const renderPassDescriptor = {
        label: "render pass descriptor",
        colorAttachments: [{
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear",
            storeOp: "store"
        }]
    }

    const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: colorTexture.createView() },
            { binding: 1, resource: linearSampler }
        ]
    })

    let lastTime = 0
    function render(time) {
        let deltaTime = time - lastTime
        lastTime = time

        timeValue.set([time / 1000], 0)
        device.queue.writeBuffer(timeBuffer, 0, timeValue)

        drawUniformsViews.drawMode[0] = altKey
        if (mouseIsDown) {
            drawUniformsViews.clickPos[0] = cursorPos.x; drawUniformsViews.clickPos[1] = cursorPos.y
        }
        else {
            drawUniformsViews.clickPos[0] = -1; drawUniformsViews.clickPos[1] = -1
        }
        drawUniformsViews.drawSize[0] = brushSize
        device.queue.writeBuffer(drawUniformsBuffer, 0, drawUniformsValues)

        const drawEncoder = device.createCommandEncoder({
            label: "draw encoder"
        })
        const drawPass = drawEncoder.beginComputePass()
        drawPass.setPipeline(drawPipeline)
        drawPass.setBindGroup(0, drawBindGroup)
        drawPass.dispatchWorkgroups(imageSize, imageSize)
        drawPass.end()

        const drawCommandBuffer = drawEncoder.finish()
        device.queue.submit([drawCommandBuffer])


        const edgeDetectEncoder = device.createCommandEncoder({
            label: "edge detect encoder"
        })
        const edgeDetectPass = edgeDetectEncoder.beginComputePass()
        edgeDetectPass.setPipeline(edgeDetectPipeline)
        edgeDetectPass.setBindGroup(0, edgeDetectBindGroup)
        edgeDetectPass.dispatchWorkgroups(imageSize, imageSize)
        edgeDetectPass.end()

        const edgeDetectCommandBuffer = edgeDetectEncoder.finish()
        device.queue.submit([edgeDetectCommandBuffer])

        for (let i = -1; i < Math.log2(imageSize); i++) {
            let thisStepSize = 1 // { 1, N/2, N/4, N/16, ..., N/N }
            if (i >= 0) {
                thisStepSize = imageSize / Math.pow(2, i + 1)
            }

            const inputTextureIndex = (i + 1) % 2
            const outputTextureIndex = (i + 2) % 2

            jfUniformsViews.stepSize[0] = thisStepSize
            device.queue.writeBuffer(jfUniformsBuffer, 0, jfUniformsValues)

            const thisBindGroup = device.createBindGroup({
                layout: jumpFloodPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: jfTextures[inputTextureIndex].createView() },
                    { binding: 1, resource: { buffer: jfUniformsBuffer } },
                    { binding: 2, resource: jfTextures[outputTextureIndex].createView() }
                ]
            })

            const jumpFloodEncoder = device.createCommandEncoder({
                label: "jump flood encoder, step" + thisStepSize
            })
            const jumpFloodPass = jumpFloodEncoder.beginComputePass()
            jumpFloodPass.setPipeline(jumpFloodPipeline)
            jumpFloodPass.setBindGroup(0, thisBindGroup)
            jumpFloodPass.dispatchWorkgroups(imageSize, imageSize)
            jumpFloodPass.end()

            const jumpFloodCommandBuffer = jumpFloodEncoder.finish()
            device.queue.submit([jumpFloodCommandBuffer])

        }

        const distanceEncoder = device.createCommandEncoder({
            label: "distance encoder"
        })
        const distancePass = distanceEncoder.beginComputePass()
        distancePass.setPipeline(distancePipeline)
        distancePass.setBindGroup(0, distanceBindGroup)
        distancePass.dispatchWorkgroups(imageSize, imageSize)
        distancePass.end()

        const distanceCommandBuffer = distanceEncoder.finish()
        device.queue.submit([distanceCommandBuffer])



        const normalEncoder = device.createCommandEncoder()
        const normalPass = normalEncoder.beginComputePass()
        normalPass.setPipeline(normalPipeline)
        normalPass.setBindGroup(0, normalBindGroup)
        normalPass.dispatchWorkgroups(imageSize, imageSize)
        normalPass.end()

        const normalCommandBuffer = normalEncoder.finish()
        device.queue.submit([normalCommandBuffer])


        const colorEncoder = device.createCommandEncoder({
            label: "convert to rgba encoder"
        })
        const colorPass = colorEncoder.beginComputePass()
        colorPass.setPipeline(colorPipeline)
        colorPass.setBindGroup(0, colorBindGroup)
        colorPass.dispatchWorkgroups(imageSize, imageSize)
        colorPass.end()

        const colorCommandBuffer = colorEncoder.finish()
        device.queue.submit([colorCommandBuffer])



        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        const renderEncoder = device.createCommandEncoder({
            label: "render encoder"
        })
        const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor)
        renderPass.setPipeline(renderPipeline)
        renderPass.setBindGroup(0, renderBindGroup)
        renderPass.draw(6)
        renderPass.end()

        const renderCommandBuffer = renderEncoder.finish()
        device.queue.submit([renderCommandBuffer])

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

/*
draw a shape
->edge detect
->color the edge detected pixels with their location, the rest undefined
->jump flooding: results in a texture where the color of each pixel is the location of the closest edge detected
->write the distance from each pixel to its color (which we know is the closest point)
->make the distance negative it the pixel was initially coloured in
*/