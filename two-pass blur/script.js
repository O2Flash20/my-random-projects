import shader1 from "./fullCanvas.wgsl.js"

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
        code: shader1
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

    const imageUrl = "Screenshot 2024-06-27 171153.png"
    const source = await loadImageBitmap(imageUrl)
    const texture = device.createTexture({
        label: imageUrl,
        format: "rgba8unorm",
        size: [source.width, source.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT
    })

    device.queue.copyExternalImageToTexture(
        { source, flipY: false },
        { texture },
        { width: source.width, height: source.height }
    )

    const sampler = device.createSampler()

    const sizeBuffer = device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const sizeValue = new Uint32Array(2)
    sizeValue.set([canvas.width, canvas.height])
    device.queue.writeBuffer(sizeBuffer, 0, sizeValue)

    const radiusBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const radiusValue = new Int32Array(1)
    radiusValue.set([15])
    device.queue.writeBuffer(radiusBuffer, 0, radiusValue)

    const ifHorizontalThen15Buffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const ifHorizontalThen15Value = new Uint32Array(1)
    ifHorizontalThen15Value.set([15])
    device.queue.writeBuffer(ifHorizontalThen15Buffer, 0, ifHorizontalThen15Value)

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: sampler },
            { binding: 1, resource: texture.createView() },
            { binding: 2, resource: { buffer: sizeBuffer } },
            { binding: 3, resource: { buffer: radiusBuffer } },
            { binding: 4, resource: { buffer: ifHorizontalThen15Buffer } }
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

    const verticalBlurredTexture = device.createTexture({
        label: "the texture that holds the vertical pass",
        format: "bgra8unorm",
        dimension: "2d",
        size: [canvas.width, canvas.height],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    })

    let lastTime = 0
    function render(time) {
        let deltaTime = time - lastTime

        sizeValue.set([canvas.width, canvas.height])
        device.queue.writeBuffer(sizeBuffer, 0, sizeValue)

        radiusValue.set([mousePos.y / 10], 0)
        device.queue.writeBuffer(radiusBuffer, 0, radiusValue)

        /* VERTICAL */

        ifHorizontalThen15Value.set([14], 0)
        device.queue.writeBuffer(ifHorizontalThen15Buffer, 0, ifHorizontalThen15Value)

        // get the current texture from the canvas context and set it as the texture to render to
        renderPassDescriptor.colorAttachments[0].view = verticalBlurredTexture.createView()

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

        /* HORIZONTAL */

        ifHorizontalThen15Value.set([15], 0)
        device.queue.writeBuffer(ifHorizontalThen15Buffer, 0, ifHorizontalThen15Value)

        const bindGroup2 = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: verticalBlurredTexture.createView() },
                { binding: 2, resource: { buffer: sizeBuffer } },
                { binding: 3, resource: { buffer: radiusBuffer } },
                { binding: 4, resource: { buffer: ifHorizontalThen15Buffer } }
            ]
        })

        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        const encoder2 = device.createCommandEncoder({
            label: "render quad encoder"
        })
        const pass2 = encoder2.beginRenderPass(renderPassDescriptor)
        pass2.setPipeline(pipeline)
        pass2.setBindGroup(0, bindGroup2)
        pass2.draw(6) //call it 6 times, 3 vertices for 2 triangles to make a quad
        pass2.end()

        const commandBuffer2 = encoder2.finish()
        device.queue.submit([commandBuffer2])

        document.getElementById("frameRateDisplay").innerText = (1000 / deltaTime).toFixed(1)

        lastTime = time

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
    const canvasBounds = document.querySelector("canvas").getBoundingClientRect()
    mousePos = {
        x: e.clientX - canvasBounds.left,
        y: e.clientY - canvasBounds.top
    }
})