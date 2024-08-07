import updateCode from "./shaders/updateWave.wgsl.js"
import transcribeCode from "./shaders/transcribe.wgsl.js"
import gradientCode from "./shaders/gradient.wgsl.js"
import renderCode from "./shaders/renderer.wgsl.js"

const waveTextureX = 600
const waveTextureY = 600

const waterPlaneHeight = 0 //ideally this would be synced with the render shader
const waterPlaneSize = { x: 20, z: 20 }

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
    // sets it up so that when you click on the canvas it locks the cursor
    mainCanvas.requestPointerLock = mainCanvas.requestPointerLock || mainCanvas.mozRequestPointerLock
    mainCanvas.addEventListener('click', () => {
        mainCanvas.requestPointerLock()
    })
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

    const obstaclesTexture = await loadTexture("rocks.png", device)

    let waveTextures = []
    let lastUpdatedTexture = 2
    for (let i = 0; i < 3; i++) {
        waveTextures[i] = device.createTexture({
            label: "wave texture " + i,
            format: "r32float",
            dimension: "2d",
            size: [waveTextureX, waveTextureY],
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
        })
    }

    const waveUniformsBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const waveUniformsValues = new ArrayBuffer(16)
    const waveUniformsViews = {
        clickPos: new Uint32Array(waveUniformsValues, 0, 2),
        textureSize: new Uint32Array(waveUniformsValues, 8, 2),
    }
    waveUniformsViews.clickPos[0] = -1; waveUniformsViews.clickPos[1] = -1
    waveUniformsViews.textureSize[0] = waveTextureX; waveUniformsViews.textureSize[1] = waveTextureY
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
        size: [waveTextureX, waveTextureY],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
    })
    // bind group will be set each frame

    // -----------------gradient setup----------------- //

    const gradientModule = device.createShaderModule({
        label: "wave gradient module",
        code: gradientCode
    })

    const gradientPipeline = device.createComputePipeline({
        label: "wave gradient pipeline",
        layout: "auto",
        compute: { module: gradientModule }
    })

    const waveGradientTexture = device.createTexture({
        label: "wave gradient texture",
        format: "rgba8unorm",
        dimension: "2d",
        size: [waveTextureX, waveTextureY],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
    })

    // -----------------render setup----------------- //

    const renderModule = device.createShaderModule({
        label: "water render module",
        code: renderCode
    })

    const renderPipeline = device.createRenderPipeline({
        label: "water render pipeline",
        layout: "auto",
        vertex: {
            module: renderModule
        },
        fragment: {
            module: renderModule,
            targets: [{ format: presentationFormat }]
        }
    })

    const renderUniformsBuffer = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const renderUniformsValues = new ArrayBuffer(48)
    const renderUniformsViews = {
        camPos: new Float32Array(renderUniformsValues, 0, 3),
        camDir: new Float32Array(renderUniformsValues, 16, 2),
        projectionDist: new Float32Array(renderUniformsValues, 24, 1),
        sunDir: new Float32Array(renderUniformsValues, 32, 2),
        screenSize: new Uint32Array(renderUniformsValues, 40, 2),
    }

    const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: renderUniformsBuffer } },
            { binding: 1, resource: transcribedWaveTexture.createView() },
            { binding: 2, resource: waveGradientTexture.createView() },
            { binding: 3, resource: obstaclesTexture.createView() },
            { binding: 4, resource: linearSampler }
        ]
    })

    const renderPassDescriptor = {
        label: "water render renderPass",
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

        updateCamera(deltaTime / 1000)

        // -----------------update stuff----------------- //
        if (mouseIsDown) { //find where the cursor is clicking on the water surface
            const clickUVx = cursorPos.x / canvas.clientWidth
            const clickUVy = cursorPos.y / canvas.clientHeight
            const aspectRatio = (canvas.clientHeight / canvas.clientWidth)
            let d = { x: -2 * clickUVx + 1, y: -2 * clickUVy * aspectRatio + aspectRatio, z: projectionDist }
            const clickScreenDirLength = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2)
            d = { //normalize
                x: d.x / clickScreenDirLength,
                y: d.y / clickScreenDirLength,
                z: d.z / clickScreenDirLength
            }
            d = { //rotate pitch
                x: d.x,
                y: d.y * Math.cos(-cameraDirection[1]) - d.z * Math.sin(-cameraDirection[1]),
                z: d.y * Math.sin(-cameraDirection[1]) + d.z * Math.cos(-cameraDirection[1])
            }
            d = { //rotate yaw
                x: d.z * Math.sin(-cameraDirection[0]) + d.x * Math.cos(-cameraDirection[0]),
                y: d.y,
                z: d.z * Math.cos(-cameraDirection[0]) - d.x * Math.sin(-cameraDirection[0])
            }

            const projectionHit = {
                x: (cameraPosition[1] - waterPlaneHeight) / d.y * d.x - cameraPosition[0],
                z: (cameraPosition[1] - waterPlaneHeight) / d.y * d.z - cameraPosition[2]
            }

            const uv = {
                x: projectionHit.x / waterPlaneSize.x + 0.5,
                z: projectionHit.z / waterPlaneSize.z + 0.5
            }

            waveUniformsViews.clickPos[0] = uv.x * waveTextureX; waveUniformsViews.clickPos[1] = uv.z * waveTextureY
        }
        else {
            waveUniformsViews.clickPos[0] = -1; waveUniformsViews.clickPos[1] = -1
        }
        device.queue.writeBuffer(waveUniformsBuffer, 0, waveUniformsValues)

        const updateBindGroup = device.createBindGroup({
            layout: updatePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: waveUniformsBuffer } },
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
        updateComputePass.dispatchWorkgroups(waveTextureX, waveTextureY)
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
        transcribeComputePass.dispatchWorkgroups(waveTextureX, waveTextureY)
        transcribeComputePass.end()
        const transcribeCommandBuffer = transcribeEncoder.finish()
        device.queue.submit([transcribeCommandBuffer])

        // -----------------gradient stuff----------------- //
        const gradientBindGroup = device.createBindGroup({
            layout: gradientPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: waveGradientTexture.createView() },
                { binding: 1, resource: waveTextures[lastUpdatedTexture].createView() }
            ]
        })

        const gradientEncoder = device.createCommandEncoder({
            label: "wave gradient command encoder"
        })
        const gradientComputePass = gradientEncoder.beginComputePass({
            label: "wave gradient compute pass"
        })
        gradientComputePass.setPipeline(gradientPipeline)
        gradientComputePass.setBindGroup(0, gradientBindGroup)
        gradientComputePass.dispatchWorkgroups(waveTextureX, waveTextureY)
        gradientComputePass.end()
        const gradientCommandBuffer = gradientEncoder.finish()
        device.queue.submit([gradientCommandBuffer])

        // -----------------render stuff----------------- //
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        renderUniformsViews.camPos[0] = cameraPosition[0]; renderUniformsViews.camPos[1] = cameraPosition[1]; renderUniformsViews.camPos[2] = cameraPosition[2]
        renderUniformsViews.camDir[0] = cameraDirection[0]; renderUniformsViews.camDir[1] = cameraDirection[1]; renderUniformsViews.camDir[2] = cameraDirection[2]
        renderUniformsViews.projectionDist[0] = projectionDist
        renderUniformsViews.sunDir[0] = 0; renderUniformsViews.sunDir[1] = Number(document.getElementById("testVal1").value)
        renderUniformsViews.screenSize[0] = mainCanvas.clientWidth; renderUniformsViews.screenSize[1] = mainCanvas.clientHeight
        device.queue.writeBuffer(renderUniformsBuffer, 0, renderUniformsValues)

        const renderEncoder = device.createCommandEncoder({
            label: "water render command encoder"
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