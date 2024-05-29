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

    const imageUrl = "./muh.jpg"
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
        { source, flipY: true },
        { texture },
        { width: source.width, height: source.height }
    )

    const sampler = device.createSampler()

    const uniformBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const timeValue = new Uint32Array(1)
    timeValue.set([0])

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: sampler },
            { binding: 1, resource: texture.createView() },
            { binding: 3, resource: { buffer: uniformBuffer } }
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

    function render(time) {
        // set the uniform buffer
        timeValue.set([time], 0)
        device.queue.writeBuffer(uniformBuffer, 0, timeValue)

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
