import worleyCode from "./shaders/worleyGenerator.wgsl.js"
import valueCode from "./shaders/valueNoiseGenerator.wgsl.js"
import fbmCode from "./shaders/fbmGenerator.wgsl.js"
import fbmwCode from "./shaders/fbmWorleyGenerator.wgsl.js"
import renderCode from "./shaders/renderer.wgsl.js"

const bigTextureSize = 128
const smallTextureSize = 32

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

    // a sampler with linear interpolation to be used on textures
    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    // set up the canvas
    const canvas = document.getElementById("mainCanvas")
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    // load up the needed textures
    const fbmwTexture = createFBMWorleyNoise(device, bigTextureSize)
    const worleyDetailTexture = createWorleyNoise(device, smallTextureSize, 12) //* r and g channels are the same

    // set up the renderer
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
        label: "render renderPass",
        colorAttachments: [
            {
                // view: <- to be filled out when we render
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: "clear",
                storeOp: "store"
            }
        ]
    }

    const uniformsBuffer = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformsValues = new ArrayBuffer(48)
    const uniformsViews = {
        time: new Float32Array(uniformsValues, 0, 1),
        pos: new Float32Array(uniformsValues, 16, 3),
        dir: new Float32Array(uniformsValues, 32, 2),
        projDist: new Float32Array(uniformsValues, 40, 1),
    }
    device.queue.writeBuffer(uniformsBuffer, 0, uniformsValues)

    const renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformsBuffer } },
            { binding: 1, resource: linearSampler },
            // { binding: 2, resource: fbmwTexture.createView() }
            { binding: 2, resource: worleyDetailTexture.createView() }
        ]
    })

    function render(time) {
        // get the current texture from the canvas context and set it as the texture to render to
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

        // update the data to pass into the renderer
        uniformsViews.time[0] = time / 1000
        device.queue.writeBuffer(uniformsBuffer, 0, uniformsValues)

        const renderEncoder = device.createCommandEncoder({
            label: "render encoder"
        })
        const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor)
        renderPass.setPipeline(renderPipeline)
        renderPass.setBindGroup(0, renderBindGroup)
        renderPass.draw(6)
        renderPass.end()

        const commandBuffer = renderEncoder.finish()
        device.queue.submit([commandBuffer])

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

main()

/*
TODO:

create one channel of fbm noise, 1 channel of worley noise, and 3 channels of layered worley noise
-> combine them to make a texture with one channel of fbm+worley (doing most of the work) and 3 layed worley (for carving away the main and making blobby shapes)
-> threshold to create empty spaces
create a 32^3 texture of layed worley noise

maybe use an fbm to offset the fbm-worley noise and make what seems like air currents, would make it more stylized

my worley layers dont look like the presentation's, probably doesnt matter idk
*/ 