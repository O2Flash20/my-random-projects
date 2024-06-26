import shaderCode from "./fullCanvas.wgsl.js"

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    // set up the canvas
    const canvas = document.querySelector("canvas")
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    // create the shader module
    const module = device.createShaderModule({
        label: "image filter shaders",
        code: shaderCode
    })

    const pipeline = device.createRenderPipeline({
        label: "image filter pipeline",
        layout: "auto",
        vertex: {
            module
        },
        fragment: {
            module,
            targets: [{ format: presentationFormat }]
        }
    })


    async function loadImageBitmap(url) {
        const res = await fetch(url)
        const blob = await res.blob()
        return await createImageBitmap(blob, { colorSpaceConversion: "none" })
    }

    const colorImageUrl = "images/colorMap.png"
    const colorImageSource = await loadImageBitmap(colorImageUrl)
    const colorTexture = device.createTexture({
        label: colorImageUrl,
        format: "rgba8unorm",
        size: [colorImageSource.width, colorImageSource.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT
    })
    device.queue.copyExternalImageToTexture(
        { source: colorImageSource, flipY: true },
        { texture: colorTexture },
        { width: colorImageSource.width, height: colorImageSource.height }
    )

    const depthImageUrl = "images/depthMap.png"
    const depthImageSource = await loadImageBitmap(depthImageUrl)
    const depthTexture = device.createTexture({
        label: depthImageUrl,
        format: "rgba8unorm",
        size: [colorImageSource.width, colorImageSource.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT
    })
    device.queue.copyExternalImageToTexture(
        { source: depthImageSource, flipY: true },
        { texture: depthTexture },
        { width: depthImageSource.width, height: depthImageSource.height }
    )

    const linearSampler = device.createSampler({
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

    const uniformsBuffer = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformsValues = new ArrayBuffer(48)
    const uniformsViews = {
        time: new Float32Array(uniformsValues, 0, 1),
        sunDirection: new Float32Array(uniformsValues, 16, 3),
        textureSize: new Uint32Array(uniformsValues, 32, 2),
    }
    uniformsViews.time[0] = 0
    uniformsViews.sunDirection[0] = 0
    uniformsViews.sunDirection[1] = 0
    uniformsViews.sunDirection[2] = 1
    uniformsViews.textureSize[0] = depthImageSource.width
    uniformsViews.textureSize[1] = depthImageSource.height
    device.queue.writeBuffer(uniformsBuffer, 0, uniformsValues)

    let bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: linearSampler },
            { binding: 1, resource: nearestSampler },
            { binding: 2, resource: colorTexture.createView() },
            { binding: 3, resource: depthTexture.createView() },
            { binding: 4, resource: { buffer: uniformsBuffer } }
        ]
    })

    const renderPassDescriptor = {
        label: "basic canvas renderPass",
        colorAttachments: [
            {
                // view: <- to be filled out when we render
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: "clear",
                storeOp: "store"
            }
        ]
    }

    let lastTime = 0
    function render(time) {
        let deltaTime = time - lastTime
        lastTime = time

        const sunDir = getSunDir()

        const uniformsValues = new ArrayBuffer(32)
        const uniformsViews = {
            time: new Float32Array(uniformsValues, 0, 1),
            sunDirection: new Float32Array(uniformsValues, 16, 3),

        }
        uniformsViews.time[0] = time
        uniformsViews.sunDirection[0] = sunDir[0]
        uniformsViews.sunDirection[1] = sunDir[1]
        uniformsViews.sunDirection[2] = sunDir[2]
        device.queue.writeBuffer(uniformsBuffer, 0, uniformsValues)
        bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: linearSampler },
                { binding: 1, resource: nearestSampler },
                { binding: 2, resource: colorTexture.createView() },
                { binding: 3, resource: depthTexture.createView() },
                { binding: 4, resource: { buffer: uniformsBuffer } }
            ]
        })

        // get the current texture from the canvas context and set it as the texture to render to
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        const encoder = device.createCommandEncoder({
            label: "render quad encoder"
        })
        const pass = encoder.beginRenderPass(renderPassDescriptor)
        pass.setPipeline(pipeline)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6) //call it 6 times, 3 vertices for 2 triangles to make a quad
        pass.end()

        const commandBuffer = encoder.finish()
        device.queue.submit([commandBuffer])

        // console.log(1000/deltaTime) 
        document.getElementById("frameRateDisplay").innerText = (1000 / deltaTime).toFixed(1)

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

let mousePos = { x: 0, y: 0 }

document.addEventListener("mousemove", function (e) {
    const canvasBounds = document.getElementById("mainCanvas").getBoundingClientRect()
    mousePos = {
        x: e.clientX - canvasBounds.left,
        y: e.clientY - canvasBounds.top
    }
})

function getSunDir() {
    const canvas = document.getElementById("mainCanvas")
    const mouseXCentered = mousePos.x - canvas.width / 2
    const mouseYCentered = mousePos.y - canvas.height / 2

    return [-mouseXCentered, mouseYCentered, -(canvas.width + canvas.height) / 4]
}