import worleyCode from "./shaders/noise/worleyGenerator.wgsl.js"
import valueCode from "./shaders/noise/valueNoiseGenerator.wgsl.js"
import fbmCode from "./shaders/noise/fbmGenerator.wgsl.js"
import fbmwCode from "./shaders/noise/fbmWorleyGenerator.wgsl.js"

import cloudRenderCode from "./shaders/cloudRenderer.wgsl.js"
import terrainRenderCode from "./shaders/terrainRenderer.wgsl.js"

import compositeCode from "./shaders/composite.wgsl.js"

const fbmwTextureSize = 128
const detailTextureSize = 32
const cloudTextureDownscale = 4

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

function createWorleyNoise(device, textureSize, gridSize) {

    // get the texture of where the point is in each grid cell
    const pointsGridTexture = createPointsGrid(device, gridSize)

    const worleyModule = device.createShaderModule({
        label: "worley compute module",
        code: worleyCode
    })
    const worleyPipeline = device.createComputePipeline({
        label: "worley compute pipeline",
        layout: "auto",
        compute: {
            module: worleyModule
        }
    })

    const worleyTexture = device.createTexture({
        label: "the 3d texture to hold the worley noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [textureSize, textureSize, textureSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    // information about the sizes of the textures that will be used
    const textureSizesBuffer = device.createBuffer({
        size: 8, // two u32s
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const textureSizesValues = new ArrayBuffer(8)
    const textureSizesViews = {
        worleyTextureSize: new Uint32Array(textureSizesValues, 0, 1),
        pointsGridTextureSize: new Uint32Array(textureSizesValues, 4, 1),
    }
    textureSizesViews.worleyTextureSize[0] = textureSize
    textureSizesViews.pointsGridTextureSize[0] = gridSize
    device.queue.writeBuffer(textureSizesBuffer, 0, textureSizesValues)

    const worleyBindGroup = device.createBindGroup({
        label: "bind group for the worley noise generator",
        layout: worleyPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: textureSizesBuffer } },
            { binding: 1, resource: worleyTexture.createView() },
            { binding: 2, resource: pointsGridTexture.createView() }
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
    worleyPass.dispatchWorkgroups(textureSize, textureSize, textureSize)
    worleyPass.end()

    const commandBuffer = worleyEncoder.finish()
    device.queue.submit([commandBuffer])

    return worleyTexture
}

function createValueNoise(device, textureSize) {
    const valueModule = device.createShaderModule({
        label: "value noise compute module",
        code: valueCode
    })

    const valuePipeline = device.createComputePipeline({
        label: "value noise compute pipeline",
        layout: "auto",
        compute: {
            module: valueModule
        }
    })

    const valueTexture = device.createTexture({
        label: "the 3d texture to hold the value noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [textureSize, textureSize, textureSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const valueBindGroup = device.createBindGroup({
        label: "bind group for the value noise generator",
        layout: valuePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: valueTexture.createView() }
        ]
    })

    const valueEncoder = device.createCommandEncoder({
        label: "value noise generator encoder"
    })

    const valuePass = valueEncoder.beginComputePass({
        label: "value noise generation pass"
    })
    valuePass.setPipeline(valuePipeline)
    valuePass.setBindGroup(0, valueBindGroup)
    valuePass.dispatchWorkgroups(textureSize, textureSize, textureSize)
    valuePass.end()

    const commandBuffer = valueEncoder.finish()
    device.queue.submit([commandBuffer])

    return valueTexture
}

// returns an rgba texture, but only r is used, the rest are empty
function createFBMNoise(device, textureSize) {

    // a texture containing 4 channels of value noise
    const valueTexture = createValueNoise(device, textureSize)

    const fbmModule = device.createShaderModule({
        label: "fbm compute module",
        code: fbmCode
    })

    const fbmPipeline = device.createComputePipeline({
        label: "fbm compute pipeline",
        layout: "auto",
        compute: {
            module: fbmModule
        }
    })

    const fbmTexture = device.createTexture({
        label: "the 3d texture to hold the fbm noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [textureSize, textureSize, textureSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const fbmBindGroup = device.createBindGroup({
        label: "bind group for the fbm noise generator",
        layout: fbmPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: fbmTexture.createView() },
            { binding: 1, resource: valueTexture.createView() }
        ]
    })

    const fbmEncoder = device.createCommandEncoder({
        label: "fbm noise generator encoder"
    })

    const fbmPass = fbmEncoder.beginComputePass({
        label: "fbm noise generation pass"
    })
    fbmPass.setPipeline(fbmPipeline)
    fbmPass.setBindGroup(0, fbmBindGroup)
    fbmPass.dispatchWorkgroups(textureSize, textureSize, textureSize)
    fbmPass.end()

    const commandBuffer = fbmEncoder.finish()
    device.queue.submit([commandBuffer])

    return fbmTexture
}

function createFBMWorleyNoise(device, textureSize) {
    // r channel is fbm+worley, gba are just layered worleys

    const fbmTexture = createFBMNoise(device, textureSize)
    const worleyTexture = createWorleyNoise(device, textureSize, 32)

    const fbmwModule = device.createShaderModule({
        label: "fbm-worley compute module",
        code: fbmwCode
    })

    const fbmwPipeline = device.createComputePipeline({
        label: "fbm-worley compute pipeline",
        layout: "auto",
        compute: {
            module: fbmwModule
        }
    })

    const fbmwTexture = device.createTexture({
        label: "the 3d texture to hold the fbm-worley noise",
        format: "rgba8unorm",
        dimension: "3d",
        size: [textureSize, textureSize, textureSize],
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    })

    const fbmwBindGroup = device.createBindGroup({
        label: "bind group for the fbm-worley noise generator",
        layout: fbmwPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: fbmTexture.createView() },
            { binding: 1, resource: worleyTexture.createView() },
            { binding: 2, resource: fbmwTexture.createView() }
        ]
    })

    const fbmwEncoder = device.createCommandEncoder({
        label: "fbm-worley noise generator encoder"
    })

    const fbmwPass = fbmwEncoder.beginComputePass({
        label: "fbm-worley noise generation pass"
    })
    fbmwPass.setPipeline(fbmwPipeline)
    fbmwPass.setBindGroup(0, fbmwBindGroup)
    fbmwPass.dispatchWorkgroups(textureSize, textureSize, textureSize)
    fbmwPass.end()

    const commandBuffer = fbmwEncoder.finish()
    device.queue.submit([commandBuffer])

    return fbmwTexture
}

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

    // a sampler with linear interpolation to be used on textures
    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    const mainCanvas = document.getElementById("mainCanvas")
    // sets it up so that when you click on the canvas it locks the cursor
    mainCanvas.requestPointerLock = mainCanvas.requestPointerLock || mainCanvas.mozRequestPointerLock
    mainCanvas.addEventListener('click', () => {
        mainCanvas.requestPointerLock()
    })
    const mainCanvasContext = mainCanvas.getContext("webgpu")
    mainCanvasContext.configure({
        device,
        format: presentationFormat
    })

    // ------------------------terrain stuff------------------------

    const terrainRenderTexture = device.createTexture({
        label: "the texture that the terrain is rendered to",
        format: "rgba16float",
        dimension: "2d",
        size: [mainCanvas.clientWidth, mainCanvas.clientHeight],
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })
    const terrainRenderModule = device.createShaderModule({
        label: "terrain render module",
        code: terrainRenderCode
    })
    const terrainRenderPipeline = device.createRenderPipeline({
        label: "terrain render pipeline",
        layout: "auto",
        vertex: { module: terrainRenderModule },
        fragment: {
            module: terrainRenderModule,
            targets: [{ format: "rgba16float" }]
        }
    })
    const terrainRenderPassDescriptor = {
        label: "terrain render pass descriptor",
        colorAttachments: [{
            // view: <- to be filled out when we render
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear",
            storeOp: "store"
        }]
    }

    const terrainUniformsBuffer = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const terrainUniformsValues = new ArrayBuffer(48)
    const terrainUniformsViews = {
        pos: new Float32Array(terrainUniformsValues, 0, 3),
        dir: new Float32Array(terrainUniformsValues, 16, 2),
        projDist: new Float32Array(terrainUniformsValues, 24, 1),
        screenSize: new Uint32Array(terrainUniformsValues, 32, 2),
        time: new Float32Array(terrainUniformsValues, 40, 1),
    }
    device.queue.writeBuffer(terrainUniformsBuffer, 0, terrainUniformsValues)

    const terrainRenderBindGroup = device.createBindGroup({
        layout: terrainRenderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: terrainUniformsBuffer } },
            // { binding: 1, resource: linearSampler }
        ]
    })

    // ------------------------cloud stuff------------------------

    const cloudRenderTexture = device.createTexture({
        label: "the texture that the clouds are rendered to",
        format: "rgba8unorm",
        dimension: "2d",
        size: [mainCanvas.clientWidth / cloudTextureDownscale, mainCanvas.clientHeight / cloudTextureDownscale],
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })

    // load up the needed textures
    const fbmwTexture = createFBMWorleyNoise(device, fbmwTextureSize)
    const worleyDetailTexture = createWorleyNoise(device, detailTextureSize, 12) //* r and g channels are the same

    // set up the renderer
    const cloudRenderModule = device.createShaderModule({
        label: "cloud render module",
        code: cloudRenderCode
    })
    const cloudRenderPipeline = device.createRenderPipeline({
        label: "cloud render pipeline",
        layout: "auto",
        vertex: { module: cloudRenderModule },
        fragment: {
            module: cloudRenderModule,
            targets: [{ format: "rgba8unorm" }]
        }
    })
    const cloudRenderPassDescriptor = {
        label: "cloud render renderPass",
        colorAttachments: [
            {
                // view: <- to be filled out when we render
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: "clear",
                storeOp: "store"
            }
        ]
    }

    const cloudUniformsBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const cloudUniformsValues = new ArrayBuffer(64)
    const cloudUniformsViews = {
        screenSize: new Uint32Array(cloudUniformsValues, 0, 2),
        time: new Float32Array(cloudUniformsValues, 8, 1),
        pos: new Float32Array(cloudUniformsValues, 16, 3),
        dir: new Float32Array(cloudUniformsValues, 32, 2),
        projDist: new Float32Array(cloudUniformsValues, 40, 1),
        testVal1: new Float32Array(cloudUniformsValues, 44, 1),
        testVal2: new Float32Array(cloudUniformsValues, 48, 1),
        testVal3: new Float32Array(cloudUniformsValues, 52, 1),
    }
    device.queue.writeBuffer(cloudUniformsBuffer, 0, cloudUniformsValues)

    const cloudRenderBindGroup = device.createBindGroup({
        layout: cloudRenderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: cloudUniformsBuffer } },
            { binding: 1, resource: linearSampler },
            { binding: 2, resource: fbmwTexture.createView() },
            { binding: 3, resource: worleyDetailTexture.createView() }
        ]
    })

    // ------------------------compositing stuff------------------------

    const compositeModule = device.createShaderModule({
        label: "compositing terrain and clouds module",
        code: compositeCode
    })
    const compositePipeline = device.createRenderPipeline({
        label: "composite pipeline",
        layout: "auto",
        vertex: { module: compositeModule },
        fragment: {
            module: compositeModule,
            targets: [{ format: presentationFormat }]
        }
    })
    const compositePassDescriptor = {
        label: "compositing renderPass",
        colorAttachments: [
            {
                // view: <- to be filled out when we render
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: "clear",
                storeOp: "store"
            }
        ]
    }

    const compositeBindGroup = device.createBindGroup({
        layout: compositePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: linearSampler },
            { binding: 1, resource: terrainRenderTexture.createView() },
            { binding: 2, resource: cloudRenderTexture.createView() }
        ]
    })


    let lastTime = 0
    function render(time) {
        let deltaTime = time - lastTime
        lastTime = time

        // updates camera information
        updateCamera(deltaTime / 1000)

        // ----------------terrain stuff----------------

        terrainRenderPassDescriptor.colorAttachments[0].view = terrainRenderTexture.createView()

        // update the data to pass into the renderer
        terrainUniformsViews.pos[0] = cameraPosition[0]; terrainUniformsViews.pos[1] = cameraPosition[1]; terrainUniformsViews.pos[2] = cameraPosition[2]
        terrainUniformsViews.dir[0] = cameraDirection[0]; terrainUniformsViews.dir[1] = cameraDirection[1]
        terrainUniformsViews.projDist[0] = projectionDist
        terrainUniformsViews.screenSize[0] = mainCanvas.clientWidth; terrainUniformsViews.screenSize[1] = mainCanvas.clientHeight
        terrainUniformsViews.time[0] = time / 1000
        device.queue.writeBuffer(terrainUniformsBuffer, 0, terrainUniformsValues)

        const terrainRenderEncoder = device.createCommandEncoder({
            label: "terrain render encoder"
        })
        const terrainRenderPass = terrainRenderEncoder.beginRenderPass(terrainRenderPassDescriptor)
        terrainRenderPass.setPipeline(terrainRenderPipeline)
        terrainRenderPass.setBindGroup(0, terrainRenderBindGroup)
        terrainRenderPass.draw(6)
        terrainRenderPass.end()

        const terrainCommandBuffer = terrainRenderEncoder.finish()
        device.queue.submit([terrainCommandBuffer])

        // ----------------cloud stuff----------------

        // get the current texture from the canvas context and set it as the texture to render to
        cloudRenderPassDescriptor.colorAttachments[0].view = cloudRenderTexture.createView()

        // update the data to pass into the renderer
        cloudUniformsViews.screenSize[0] = mainCanvas.clientWidth / cloudTextureDownscale; cloudUniformsViews.screenSize[1] = mainCanvas.clientHeight / cloudTextureDownscale
        cloudUniformsViews.time[0] = time / 1000
        cloudUniformsViews.pos[0] = cameraPosition[0]; cloudUniformsViews.pos[1] = cameraPosition[1]; cloudUniformsViews.pos[2] = cameraPosition[2]
        cloudUniformsViews.dir[0] = cameraDirection[0]; cloudUniformsViews.dir[1] = cameraDirection[1]
        cloudUniformsViews.projDist[0] = projectionDist
        cloudUniformsViews.testVal1[0] = Number(document.getElementById("t1").value)
        cloudUniformsViews.testVal2[0] = Number(document.getElementById("t2").value)
        cloudUniformsViews.testVal3[0] = Number(document.getElementById("t3").value)
        device.queue.writeBuffer(cloudUniformsBuffer, 0, cloudUniformsValues)

        const cloudRenderEncoder = device.createCommandEncoder({
            label: "cloud render encoder"
        })
        const cloudRenderPass = cloudRenderEncoder.beginRenderPass(cloudRenderPassDescriptor)
        cloudRenderPass.setPipeline(cloudRenderPipeline)
        cloudRenderPass.setBindGroup(0, cloudRenderBindGroup)
        cloudRenderPass.draw(6)
        cloudRenderPass.end()

        const cloudCommandBuffer = cloudRenderEncoder.finish()
        device.queue.submit([cloudCommandBuffer])

        // ----------------compositing stuff----------------

        compositePassDescriptor.colorAttachments[0].view = mainCanvasContext.getCurrentTexture().createView()

        const compositeEncoder = device.createCommandEncoder({
            label: "composite encoder"
        })
        const compositeRenderPass = compositeEncoder.beginRenderPass(compositePassDescriptor)
        compositeRenderPass.setPipeline(compositePipeline)
        compositeRenderPass.setBindGroup(0, compositeBindGroup)
        compositeRenderPass.draw(6)
        compositeRenderPass.end()

        const compositeCommandBuffer = compositeEncoder.finish()
        device.queue.submit([compositeCommandBuffer])

        // -------------------------------------------------

        document.getElementById("frameRateDisplay").innerText = (1000 / deltaTime).toFixed(1)
        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

main()

/*
TODO:
maybe use an fbm to offset the fbm-worley noise and make what seems like air currents, would make it more stylized
simulate curvature of the earth? (and therefore clouds)
atmosphere
depth fog
have another pass to scale up the clouds to HD

1. render everything but the clouds and atmosphere in HD, include the depth buffer
2. render the clouds and atmosphere in a lower resolution pass, making sure to have the clouds be occluded by the depth buffer, the cloud's fog would be the colour of the atmosphere behind it, alpha channel important
3. the clouds and atmosphere are upscaled (reprojection too, whatever that is?) and overlayed on the terrain using the alpha channel of the low resolution texture
*/ 