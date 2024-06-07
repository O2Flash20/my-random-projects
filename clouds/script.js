import rendererShaderCode from "./renderer.wgsl.js"
import worleyShaderCode from "./worleyGenerator.wgsl.js"

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    // *--------first, create the worley noise--------
    const worleyModule = device.createShaderModule({
        label: "worley compute module",
        code: worleyShaderCode
    })

    const worleyPipeline = device.createComputePipeline({
        label: "worley compute pipeline",
        layout: "auto",
        compute: {
            module: worleyModule
        }
    })

    // this texture will be written to by the compute shader to create the worley noise
    const worleyWorkTexture = device.createTexture({
        label: "the 3d texture to create the worley noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [200, 200, 200],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC // | GPUTextureUsage.TEXTURE_BINDING
    })

    // this texture will hold the noise for the renderer to use
    const worleyNoiseTexture = device.createTexture({
        label: "the 3d texture to hold the worley noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [200, 200, 200],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    })

    const worleyBindGroup = device.createBindGroup({
        label: "bind group for the worley noise computer",
        layout: worleyPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: worleyWorkTexture.createView() }
        ]
    })

    const worleyEncoder = device.createCommandEncoder({
        label: "worley noise generator encoder"
    })

    // copy the worley noise to another texture that is not storage and can be sampled from
    // ! not copying for some reason?
    worleyEncoder.copyTextureToTexture(
        { texture: worleyWorkTexture },
        { texture: worleyNoiseTexture },
        { width: 200, height: 200, depthOrArrayLayers: 200 }
    )
    // worleyEncoder.copyTextureToTexture(
    //     src:{worleyWorkTexture, }
    // )

    const worleyPass = worleyEncoder.beginComputePass({
        label: "worley noise generation pass"
    })
    worleyPass.setPipeline(worleyPipeline)
    worleyPass.setBindGroup(0, worleyBindGroup)
    worleyPass.dispatchWorkgroups(200, 200, 200)
    worleyPass.end()

    const worleyCommandBuffer = worleyEncoder.finish()
    device.queue.submit([worleyCommandBuffer])


    // *--------create the renderer and start rendering--------
    // set up the canvas
    const canvas = document.querySelector("canvas")
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    // create the shader module
    const rendererModule = device.createShaderModule({
        label: "raymarcher shaders",
        code: rendererShaderCode
    })

    const rendererPipeline = device.createRenderPipeline({
        label: "ray marching pipeline",
        layout: "auto",
        vertex: {
            module: rendererModule
        },
        fragment: {
            module: rendererModule,
            targets: [{ format: presentationFormat }]
        }
    })

    const timeBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const cameraBuffer = device.createBuffer({
        size: 4 * 4 + 4 * 4, //one vec3 and one vec2
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const timeUniformArray = new Uint32Array(1)
    timeUniformArray.set([0])

    const cameraUniformsArray = new Float32Array(8)
    cameraUniformsArray.set(cameraPosition, 0)
    cameraUniformsArray.set(cameraDirection, 4)

    const textureSampler = device.createSampler()

    const rendererBindGroup = device.createBindGroup({
        layout: rendererPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: timeBuffer } },
            { binding: 1, resource: { buffer: cameraBuffer } },
            { binding: 2, resource: worleyNoiseTexture.createView() },
            // { binding: 2, resource: worleyWorkTexture.createView() },
            { binding: 3, resource: textureSampler }
        ]
    })

    const renderPassDescriptor = {
        label: "ray marching renderPass",
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

        // set the buffers
        timeUniformArray.set([time], 0)
        device.queue.writeBuffer(timeBuffer, 0, timeUniformArray)

        cameraUniformsArray.set(cameraPosition, 0)
        cameraUniformsArray.set(cameraDirection, 4)
        device.queue.writeBuffer(cameraBuffer, 0, cameraUniformsArray)

        // get the current texture from the canvas context and set it as the texture to render to
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        const renderEncoder = device.createCommandEncoder({
            label: "render shaders encoder"
        })
        const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor)
        renderPass.setPipeline(rendererPipeline)
        renderPass.setBindGroup(0, rendererBindGroup)
        renderPass.draw(6) //call it 6 times, 3 vertices for 2 triangles to make a quad
        renderPass.end()

        const commandBuffer = renderEncoder.finish()
        device.queue.submit([commandBuffer])

        document.getElementById("frameRateDisplay").innerText = (1000 / deltaTime).toFixed(1)

        // animate direction for now
        cameraDirection[0] = time / 1000
        cameraDirection[1] = Math.sin(time / 1000) / 5
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

let cameraPosition = [0, 10, 0]
let cameraDirection = [0, 0] //yaw then pitch

/*
compute shader for worley noise -> outputs a 1d buffer
    fractal, multiple layers that each get smaller
3d rendering shader reads that

todo: manual controls, figure out if/how to do the worley noise as a 3d texture, anti-aliasing
*/