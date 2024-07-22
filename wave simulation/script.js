import updateCode from "./shaders/updateWave.wgsl.js"
import transcribeCode from "./shaders/transcribe.wgsl.js"
import renderCode from "./shaders/renderWave.wgsl.js"

async function loadTexture(url, device) {

    async function loadImageBitmap(url) {
        const res = await fetch(url)
        const blob = await res.blob()
        return await createImageBitmap(blob, { colorSpaceConversion: "none" })
    }

    const source = await loadImageBitmap(url)
    const texture = device.createTexture({
        label: url,
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

    return texture
}

async function main() {

    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    const canvas = document.getElementById("mainCanvas")
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    let mouseIsDown = false
    canvas.addEventListener("mousedown", function () { mouseIsDown = true })
    canvas.addEventListener("mouseup", function () { mouseIsDown = false })
    let cursorPos = { x: 0, y: 0 }
    document.addEventListener("mousemove", function (e) {
        const canvasBounds = canvas.getBoundingClientRect()
        cursorPos = {
            x: e.clientX - canvasBounds.left,
            y: e.clientY - canvasBounds.top
        }
    })

    const updateModule = device.createShaderModule({
        label: "wave update shader module",
        code: updateCode
    })

    const updatePipeline = device.createComputePipeline({
        label: "wave update pipeline",
        layout: "auto",
        compute: { module: updateModule }
    })

    const obstaclesTexture = await loadTexture("obstacles.png", device)

    let waveTextures = []
    let lastUpdatedTexture = 2
    for (let i = 0; i < 3; i++) {
        waveTextures[i] = device.createTexture({
            label: "wave texture " + i,
            format: "r32float",
            dimension: "2d",
            size: [canvas.clientWidth, canvas.clientHeight],
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
        })
    }

    const uniformsBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformsValues = new ArrayBuffer(16)
    const uniformsViews = {
        clickPos: new Uint32Array(uniformsValues, 0, 2),
        textureSize: new Uint32Array(uniformsValues, 8, 2),
    }
    uniformsViews.clickPos[0] = -1; uniformsViews.clickPos[1] = -1
    uniformsViews.textureSize[0] = canvas.clientWidth; uniformsViews.textureSize[1] = canvas.clientHeight
    // bind group will be set each frame

    // -----------------transcription setup----------------- //
    //* the wave is in an r16float texture, it needs to be transcribed to an rgba8unorm so that it can be rendered in a fragment shader

    const transcribeModule = device.createShaderModule({
        label: "wave texture transcribe module",
        code: transcribeCode
    })

    const transcribePipeline = device.createComputePipeline({
        label: "wave texture transcribe pipeline",
        layout: "auto",
        compute: { module: transcribeModule }
    })

    const transcribedWaveTexture = device.createTexture({
        label: "transcribed wave texture to an rgba8unorm texture",
        format: "rgba8unorm",
        dimension: "2d",
        size: [canvas.clientWidth, canvas.clientHeight],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
    })
    // bind group will be set each frame

    // -----------------render setup----------------- //

    const renderModule = device.createShaderModule({
        label: "wave render module",
        code: renderCode
    })

    const renderPipeline = device.createRenderPipeline({
        label: "wave render pipeline",
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
            { binding: 0, resource: transcribedWaveTexture.createView() },
            { binding: 1, resource: linearSampler },
            { binding: 2, resource: obstaclesTexture.createView() }
        ]
    })

    const renderPassDescriptor = {
        label: "wave render renderPass",
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

        // -----------------update stuff----------------- //
        if (mouseIsDown) {
            uniformsViews.clickPos[0] = cursorPos.x; uniformsViews.clickPos[1] = cursorPos.y
        }
        else {
            uniformsViews.clickPos[0] = -1; uniformsViews.clickPos[1] = -1
        }
        device.queue.writeBuffer(uniformsBuffer, 0, uniformsValues)

        const updateBindGroup = device.createBindGroup({
            layout: updatePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: uniformsBuffer } },
                { binding: 1, resource: waveTextures[(lastUpdatedTexture + 1) % 3].createView() },
                { binding: 2, resource: waveTextures[lastUpdatedTexture].createView() },
                { binding: 3, resource: waveTextures[(lastUpdatedTexture + 2) % 3].createView() }, //adding 2 gets the texture before because of mod 3
                { binding: 4, resource: obstaclesTexture.createView() }
            ]
        })

        const updateEncoder = device.createCommandEncoder({
            label: "wave update command encoder"
        })
        const updateComputePass = updateEncoder.beginComputePass({
            label: "wave update compute pass"
        })
        updateComputePass.setPipeline(updatePipeline)
        updateComputePass.setBindGroup(0, updateBindGroup)
        updateComputePass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
        updateComputePass.end()
        const updateCommandBuffer = updateEncoder.finish()
        device.queue.submit([updateCommandBuffer])

        lastUpdatedTexture = (lastUpdatedTexture + 1) % 3 //a new texture has just been updated


        // -----------------transcription stuff----------------- //
        const transcribeBindGroup = device.createBindGroup({
            layout: transcribePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: transcribedWaveTexture.createView() },
                { binding: 1, resource: waveTextures[lastUpdatedTexture].createView() }
            ]
        })

        const transcribeEncoder = device.createCommandEncoder({
            label: "wave texture transcribe command encoder"
        })
        const transcribeComputePass = transcribeEncoder.beginComputePass({
            label: "wave texture transcribe compute pass"
        })
        transcribeComputePass.setPipeline(transcribePipeline)
        transcribeComputePass.setBindGroup(0, transcribeBindGroup)
        transcribeComputePass.dispatchWorkgroups(canvas.clientWidth, canvas.clientHeight)
        transcribeComputePass.end()
        const transcribeCommandBuffer = transcribeEncoder.finish()
        device.queue.submit([transcribeCommandBuffer])


        // -----------------render stuff----------------- //
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        const renderEncoder = device.createCommandEncoder({
            label: "wave render command encoder"
        })
        const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor)
        renderPass.setPipeline(renderPipeline)
        renderPass.setBindGroup(0, renderBindGroup)
        renderPass.draw(6)
        renderPass.end()
        const renderCommandBuffer = renderEncoder.finish()
        device.queue.submit([renderCommandBuffer])
        // the wave should now be rendered to the screen

        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}
main()