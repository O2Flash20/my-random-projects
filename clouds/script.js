import rendererShaderCode from "./renderer.wgsl.js"
import worleyShaderCode from "./worleyGenerator.wgsl.js"

const WorleyTextureSize = 300 //pretty much the max it can be
const PointsGridTextureSize = 32 // for the most detailed layer

// creates a texture representing a grid with a point randomly placed in each cell
function createPointsGrid(device, gridSize) {
    const pointsGridModule = device.createShaderModule({
        label: "points grid compute module",
        code: /*wgsl*/ `

        @group(0) @binding(0) var pointsGridTexture: texture_storage_3d<rgba8unorm, write>;

        const gridSize = ${gridSize};

        // thanks chatgpt buddy
        fn hash3(u: vec3<u32>) -> vec3<f32> {
            let k1: u32 = 0x456789ab;
            let k2: u32 = 0x789abcde;
            let k3: u32 = 0x12345678;

            var n: u32 = u.x + u.y * k1 + u.z * k2;
            n = n ^ (n >> 13);
            n = n * (n * n * k3 + 0x2fd2f4c3);
            n = n ^ (n >> 16);

            return vec3<f32>(
                f32((n >> 0) & 0xff) / 255.0,
                f32((n >> 8) & 0xff) / 255.0,
                f32((n >> 16) & 0xff) / 255.0
            );
        }

        fn random3d(input: vec3<u32>) -> vec3<f32> {
            let randomVec = hash3(input);
            return randomVec;
        }

        @compute @workgroup_size(1) fn generateGridPoints(
            @builtin(global_invocation_id) id:vec3<u32>
        ){
            textureStore(pointsGridTexture, id, vec4f( random3d(id), 1.));
        }

        `
    })

    const pointsGridPipeline = device.createComputePipeline({
        label: "points grid generator compute pipeline",
        layout: "auto",
        compute: {
            module: pointsGridModule
        }
    })

    const pointsGridTexture = device.createTexture({
        label: "a 3d texture representing a grid with randomly placed points",
        format: "rgba8unorm",
        dimension: "3d",
        size: [gridSize, gridSize, gridSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const pointsGridBindGroup = device.createBindGroup({
        label: "points grid shader bind group",
        layout: pointsGridPipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: pointsGridTexture.createView() }]
    })

    const pointsGridEncoder = device.createCommandEncoder({
        label: "points grid command encoder"
    })

    const pointsGridPass = pointsGridEncoder.beginComputePass({
        label: "points grid compute pass"
    })


    pointsGridPass.setPipeline(pointsGridPipeline)
    pointsGridPass.setBindGroup(0, pointsGridBindGroup)
    pointsGridPass.dispatchWorkgroups(gridSize, gridSize, gridSize)
    pointsGridPass.end()

    const pointsGridCommandBuffer = pointsGridEncoder.finish()
    device.queue.submit([pointsGridCommandBuffer])

    return pointsGridTexture
}

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    // a sampler with linear interpolation to be used on textures
    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

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

    const pointsGridTexture = createPointsGrid(device, PointsGridTextureSize)

    // this texture will be written to by the compute shader to create the worley noise
    const worleyWorkTexture = device.createTexture({
        label: "the 3d texture to create the worley noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [WorleyTextureSize, WorleyTextureSize, WorleyTextureSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC //| GPUTextureUsage.TEXTURE_BINDING
    })

    // this texture will hold the noise for the renderer to use
    const worleyNoiseTexture = device.createTexture({
        label: "the 3d texture to hold the worley noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [WorleyTextureSize, WorleyTextureSize, WorleyTextureSize],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    })

    // information about the sizes of the textures that will be used
    const textureSizesBuffer = device.createBuffer({
        size: 2 * 4, // two u32s
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const textureSizesValues = new ArrayBuffer(8)
    const textureSizesViews = {
        worleyTextureSize: new Uint32Array(textureSizesValues, 0, 1),
        pointsGridTextureSize: new Uint32Array(textureSizesValues, 4, 1),
    }
    textureSizesViews.worleyTextureSize[0] = WorleyTextureSize
    textureSizesViews.pointsGridTextureSize[0] = PointsGridTextureSize
    device.queue.writeBuffer(textureSizesBuffer, 0, textureSizesValues)

    const worleyBindGroup = device.createBindGroup({
        label: "bind group for the worley noise computer",
        layout: worleyPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: textureSizesBuffer } },
            { binding: 1, resource: worleyWorkTexture.createView() },
            { binding: 2, resource: pointsGridTexture.createView() },
        ]
    })

    const worleyEncoder = device.createCommandEncoder({
        label: "worley noise generator encoder"
    })


    const worleyPass = worleyEncoder.beginComputePass({
        label: "worley noise generation pass"
    })
    worleyPass.setPipeline(worleyPipeline)
    worleyPass.setBindGroup(0, worleyBindGroup)
    worleyPass.dispatchWorkgroups(WorleyTextureSize, WorleyTextureSize, WorleyTextureSize)
    worleyPass.end()

    // copy the worley noise to another texture that is not storage and can be sampled from
    worleyEncoder.copyTextureToTexture(
        { texture: worleyWorkTexture },
        { texture: worleyNoiseTexture },
        [WorleyTextureSize, WorleyTextureSize, WorleyTextureSize]
    )

    const worleyCommandBuffer = worleyEncoder.finish()
    device.queue.submit([worleyCommandBuffer])


    // *--------create the renderer and start rendering--------
    // set up the canvas
    const canvas = document.querySelector("canvas")

    // locks the cursor when you click on the canvas
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock()
    })

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
        size: 2 * 4 * 4, //one vec3, one vec2, and one f32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const timeUniformArray = new Uint32Array(1)
    timeUniformArray.set([0])

    const cameraValues = new ArrayBuffer(32)
    const cameraViews = {
        position: new Float32Array(cameraValues, 0, 3),
        direction: new Float32Array(cameraValues, 16, 2),
        projectionDist: new Float32Array(cameraValues, 24, 1),
    }
    cameraViews.position[0] = cameraPosition[0]
    cameraViews.position[1] = cameraPosition[1]
    cameraViews.position[2] = cameraPosition[2]
    cameraViews.direction[0] = cameraDirection[0]
    cameraViews.direction[1] = cameraDirection[1]
    cameraViews.projectionDist[0] = projectionDist
    device.queue.writeBuffer(cameraBuffer, 0, cameraValues)

    const rendererBindGroup = device.createBindGroup({
        layout: rendererPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: timeBuffer } },
            { binding: 1, resource: { buffer: cameraBuffer } },
            { binding: 2, resource: worleyNoiseTexture.createView() },
            { binding: 3, resource: linearSampler }
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

        updateCamera(deltaTime / 1000) //function defined in controlsHandler.js

        // set the buffers
        timeUniformArray.set([time], 0)
        device.queue.writeBuffer(timeBuffer, 0, timeUniformArray)

        cameraViews.position[0] = cameraPosition[0]
        cameraViews.position[1] = cameraPosition[1]
        cameraViews.position[2] = cameraPosition[2]
        cameraViews.direction[0] = cameraDirection[0]
        cameraViews.direction[1] = cameraDirection[1]
        cameraViews.projectionDist[0] = projectionDist
        device.queue.writeBuffer(cameraBuffer, 0, cameraValues)

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

        requestAnimationFrame(render) //to the next frame
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
todo: anti-aliasing, actual clouds :)
*/