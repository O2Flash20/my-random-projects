import atmosphereCode from "./atmosphereRenderer.js"

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    // set up the canvas
    const mainCanvas = document.getElementById("mainCanvas")
    // sets it up so that when you click on the canvas it locks the cursor
    mainCanvas.requestPointerLock = mainCanvas.requestPointerLock || mainCanvas.mozRequestPointerLock
    mainCanvas.addEventListener('click', () => {
        mainCanvas.requestPointerLock()
    })
    const context = mainCanvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    // create the shader module
    const atmosphereModule = device.createShaderModule({
        label: "atmosphere rendering module",
        code: atmosphereCode
    })

    const atmospherePipeline = device.createRenderPipeline({
        label: "atmosphere rendering pipeline",
        layout: "auto",
        vertex: {
            module: atmosphereModule
        },
        fragment: {
            module: atmosphereModule,
            targets: [{ format: presentationFormat }]
        }
    })

    const uniformsBuffer = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformsValues = new ArrayBuffer(48)
    const uniformsViews = {
        camPos: new Float32Array(uniformsValues, 0, 3),
        camDir: new Float32Array(uniformsValues, 16, 2),
        projectionDist: new Float32Array(uniformsValues, 24, 1),
        sunDir: new Float32Array(uniformsValues, 32, 2),
        screenSize: new Uint32Array(uniformsValues, 40, 2),
    }

    const atmosphereBindGroup = device.createBindGroup({
        layout: atmospherePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformsBuffer } }
        ]
    })

    const atmosphereRenderPassDescriptor = {
        label: "atmosphere renderPass",
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

        updateCamera(deltaTime)

        uniformsViews.camPos[0] = cameraPosition[0]; uniformsViews.camPos[1] = cameraPosition[1]; uniformsViews.camPos[2] = cameraPosition[2]
        uniformsViews.camDir[0] = cameraDirection[0]; uniformsViews.camDir[1] = cameraDirection[1]; uniformsViews.camDir[2] = cameraDirection[2]
        uniformsViews.projectionDist[0] = projectionDist
        uniformsViews.sunDir[0] = 0; uniformsViews.sunDir[1] = Number(document.getElementById("testVal1").value)
        uniformsViews.screenSize[0] = mainCanvas.clientWidth; uniformsViews.screenSize[1] = mainCanvas.clientHeight
        device.queue.writeBuffer(uniformsBuffer, 0, uniformsValues)

        // get the current texture from the canvas context and set it as the texture to render to
        atmosphereRenderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        const atmosphereCommandEncoder = device.createCommandEncoder({
            label: "render atmosphere encoder"
        })
        const atmospherePass = atmosphereCommandEncoder.beginRenderPass(atmosphereRenderPassDescriptor)
        atmospherePass.setPipeline(atmospherePipeline)
        atmospherePass.setBindGroup(0, atmosphereBindGroup)
        atmospherePass.draw(6) //call it 6 times, 3 vertices for 2 triangles to make a quad
        atmospherePass.end()

        const atmosphereCommandBuffer = atmosphereCommandEncoder.finish()
        device.queue.submit([atmosphereCommandBuffer])

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
    observer.observe(mainCanvas)
}
main()
