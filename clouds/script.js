import shader1 from "./shader.wgsl.js"

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
        label: "raymarcher shaders",
        code: shader1
    })

    const pipeline = device.createRenderPipeline({
        label: "ray marching pipeline",
        layout: "auto",
        vertex: {
            module
        },
        fragment: {
            module,
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

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: timeBuffer } },
            { binding: 1, resource: { buffer: cameraBuffer } }
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

        const encoder = device.createCommandEncoder({
            label: "shaders encoder"
        })
        const pass = encoder.beginRenderPass(renderPassDescriptor)
        pass.setPipeline(pipeline)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6) //call it 6 times, 3 vertices for 2 triangles to make a quad
        pass.end()

        const commandBuffer = encoder.finish()
        device.queue.submit([commandBuffer])

        // console.log(1000 / deltaTime)
        document.getElementById("frameRateDisplay").innerText = (1000 / deltaTime).toFixed(1)

        // animate direction for now
        cameraDirection[0] = time / 1000
        cameraDirection[1] = Math.sin(time / 1000) / 2
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
*/