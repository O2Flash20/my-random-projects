const imageWidth = 100
const imageHeight = 100

const maxEdgePixels = imageWidth * imageHeight / 2
const pointsArrayLength = maxEdgePixels / 2 // divided by two because there are two points per buffer index (saved as vec4)

import jumpFloodCode from "./jumpFlood.wgsl.js"
import convertCode from "./convert.wgsl.js"
import renderCode from "./render.wgsl.js"

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
    canvas.width = imageWidth*10
    canvas.height = imageHeight*10
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    const linearSampler = device.createSampler({
        // addressModeU: "repeat",
        // addressModeV: "repeat",
        // addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    // create the shader module
    const jumpFloodModule = device.createShaderModule({
        label: "jump flooding module",
        code: jumpFloodCode
    })

    const jumpFloodPipeline = device.createComputePipeline({
        label: "jump flooding pipeline",
        layout: "auto",
        compute: {
            module: jumpFloodModule
        }
    })

    const distancesTexture = device.createTexture({
        label: "a texture holding the result of the jump flooding",
        format: "r32float",
        dimension: "2d",
        size: [imageWidth, imageHeight],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const pointsBuffer = device.createBuffer({
        size: 16 + 16 * pointsArrayLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const pointsInfoValues = new ArrayBuffer(16 + 16 * pointsArrayLength)
    const pointsInfoViews = {
        numPoints: new Uint32Array(pointsInfoValues, 0, 1),
        points: new Uint32Array(pointsInfoValues, 16, 4 * pointsArrayLength),
    }
    device.queue.writeBuffer(pointsBuffer, 0, pointsInfoValues)

    const jumpFloodBindGroup = device.createBindGroup({
        layout: jumpFloodPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: pointsBuffer } },
            { binding: 1, resource: distancesTexture.createView() }
        ]
    })



    const converterModule = device.createShaderModule({
        label: "convert to rgba module",
        code: convertCode
    })

    const converterPipeline = device.createComputePipeline({
        label: "convert to rgba pipeline",
        layout: "auto",
        compute: { module: converterModule }
    })

    const distancesColor = device.createTexture({
        label: "a full-color texture representing the distances",
        format: "rgba8unorm",
        dimension: "2d",
        size: [imageWidth, imageHeight],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const converterBindGroup = device.createBindGroup({
        layout: converterPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: distancesTexture.createView() },
            { binding: 1, resource: distancesColor.createView() }
        ]
    })



    const renderModule = device.createShaderModule({
        label: "render module",
        code: renderCode
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
            // view: 
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear",
            storeOp: "store"
        }]
    }

    const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: distancesColor.createView() },
            { binding: 1, resource: linearSampler }
        ]
    })

    let lastTime = 0
    function render(time) {
        let deltaTime = time - lastTime
        lastTime = time

        pointsInfoViews.numPoints[0] = 1
        pointsInfoViews.points[0] = 10; pointsInfoViews.points[1] = 10
        pointsInfoViews.points[2] = 20; pointsInfoViews.points[3] = 10 * Math.sin(time/1000) + 15
        device.queue.writeBuffer(pointsBuffer, 0, pointsInfoValues)

        const jumpFloodEncoder = device.createCommandEncoder({
            label: "jump flood encoder"
        })
        const jumpFloodPass = jumpFloodEncoder.beginComputePass()
        jumpFloodPass.setPipeline(jumpFloodPipeline)
        jumpFloodPass.setBindGroup(0, jumpFloodBindGroup)
        jumpFloodPass.dispatchWorkgroups(imageWidth, imageHeight)
        jumpFloodPass.end()

        const jumpFloodCommandBuffer = jumpFloodEncoder.finish()
        device.queue.submit([jumpFloodCommandBuffer])


        const converterEncoder = device.createCommandEncoder({
            label: "convert to rgba encoder"
        })
        const converterPass = converterEncoder.beginComputePass()
        converterPass.setPipeline(converterPipeline)
        converterPass.setBindGroup(0, converterBindGroup)
        converterPass.dispatchWorkgroups(imageWidth, imageHeight)
        converterPass.end()

        const converterCommandBuffer = converterEncoder.finish()
        device.queue.submit([converterCommandBuffer])


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

// There will actually only be a max of width*height/2 points because of the edge detect