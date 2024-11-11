import renderCode from "./shaders/rasterize.wgsl.js"
import textureCode from "./shaders/texture.wgsl.js"
import testCode from "./shaders/display.wgsl.js"

import Camera from "./camera.js"
import Scene from "./scene.js"
import { CubeVertices, Object } from "./object.js"
import { Materials, compileMaterials } from "./materials.js"

async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    const canvas = document.getElementById("mainCanvas")
    const context = canvas.getContext("webgpu")
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device,
        format: presentationFormat,
    })

    // a sampler with linear interpolation to be used on textures
    const linearSampler = device.createSampler({
        addressModeU: "repeat",
        addressModeV: "repeat",
        addressModeW: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
    })

    // ---------- MATERIALS ----------
    const materialInformation = await compileMaterials(Materials, device)

    // ---------- SCENE SETUP ----------

    const rasterizeTargetFormats = [
        { format: "r32uint" }, //material
        { format: "rgba32float" }, //normal
        { format: "rg32float" } //uv
    ]

    const cameraUniformBuffer = device.createBuffer({
        size: 4 * 4 * 4, //4 by 4 matrix of 4 bytes
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const camera = new Camera(0, 0, 0, 0, 0)

    const scene = new Scene()

    const testObject = new Object(3, 0, -10, 1, { device, formats: rasterizeTargetFormats, cameraUniformBuffer, renderCode })
    testObject.setVertices(CubeVertices)
    scene.addObject(testObject)

    const testObject2 = new Object(-3, 0, -5, 2, { device, formats: rasterizeTargetFormats, cameraUniformBuffer, renderCode })
    testObject2.setVertices(CubeVertices)
    scene.addObject(testObject2)

    // ---------- RASTERIZING STEP ----------

    const depthBuffer = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "depth24plus-stencil8", //a special format to be used as a depth stencil
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })

    const rasterizeTargets = {
        material:
            device.createTexture({
                size: [canvas.width, canvas.height],
                format: rasterizeTargetFormats[0].format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            }),

        normal:
            device.createTexture({
                size: [canvas.width, canvas.height],
                format: rasterizeTargetFormats[1].format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            }),

        uv:
            device.createTexture({
                size: [canvas.width, canvas.height],
                format: rasterizeTargetFormats[2].format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            })
    }

    const rasterizePassDescriptor = {
        colorAttachments: [
            {
                view: rasterizeTargets.material.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            },
            {
                view: rasterizeTargets.normal.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            },
            {
                view: rasterizeTargets.uv.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            }
        ],
        depthStencilAttachment: {
            // view: createDepthBuffer(device, canvas).createView(),
            view: depthBuffer.createView(),

            depthLoadOp: 'clear',
            depthClearValue: 1.0,
            depthStoreOp: 'store',
            stencilLoadOp: 'clear',
            stencilClearValue: 0,
            stencilStoreOp: 'store',
        }
    }

    // ---------- TEXTURING STEP ----------
    const textureModule = device.createShaderModule({
        label: "texturing module",
        code:
            textureCode
                .replace("_TEXTURE_INPUT", materialInformation.textureImportCode)
                .replace("_TEXTURE_SAMPLE", materialInformation.textureSampleCode)
                .replace("_MATERIALS", materialInformation.materialsCode)
    })

    const colorBuffer = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "rgba8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })
    const normalBuffer = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "rgba32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })
    const roughnessBuffer = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "r8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })
    const metallicBuffer = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "r8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })

    const texturePipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: textureModule },
        fragment: {
            module: textureModule,
            targets: [
                { format: "rgba8unorm" }, //color
                { format: "rgba32float" }, //normal (after normal map)
                { format: "r8unorm" }, //roughness
                { format: "r8unorm" } //metallic
            ]
        }
    })

    const textureRenderPassDescriptor = {
        colorAttachments: [
            {
                view: colorBuffer.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            },
            {
                view: normalBuffer.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            },
            {
                view: roughnessBuffer.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            },
            {
                view: metallicBuffer.createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store"
            }
        ]
    }

    // an array containing both the necessary textures and the ones coming from the materials
    const textureBindGroupEntries = [
        { binding: 0, resource: linearSampler },
        { binding: 1, resource: rasterizeTargets.material.createView() },
        { binding: 2, resource: rasterizeTargets.normal.createView() },
        { binding: 3, resource: rasterizeTargets.uv.createView() }
    ].concat(materialInformation.bindGroupEntries)

    const textureBindGroup = device.createBindGroup({
        layout: texturePipeline.getBindGroupLayout(0),
        entries: textureBindGroupEntries
    })

    // ---------- DISPLAY STEP ----------
    const displayModule = device.createShaderModule({
        label: "display module",
        code: testCode
    })

    const displayPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: displayModule },
        fragment: {
            module: displayModule,
            targets: [{ format: presentationFormat }]
        }
    })
    const displayRenderPassDescriptor = {
        colorAttachments: [{
            // view: <- to be filled out when we render
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear",
            storeOp: "store"
        }]
    }

    const displayBindGroup = device.createBindGroup({
        layout: displayPipeline.getBindGroupLayout(0),
        entries: [
            // { binding: 0, resource: linearSampler },
            // { binding: 1, resource: rasterizeTargets.material.createView() },
            // { binding: 2, resource: rasterizeTargets.normal.createView() },
            // { binding: 3, resource: rasterizeTargets.uv.createView() },
            // { binding: 4, resource: depthBuffer.createView({ aspect: "depth-only" }) }

            { binding: 0, resource: linearSampler },
            { binding: 1, resource: rasterizeTargets.uv.createView() },
            { binding: 2, resource: rasterizeTargets.normal.createView() },
            { binding: 3, resource: colorBuffer.createView() },
            { binding: 4, resource: normalBuffer.createView() },
            { binding: 5, resource: roughnessBuffer.createView() },
            { binding: 6, resource: metallicBuffer.createView() }

        ]
    })



    // THE LOOP TO RUN EVERY FRAME
    let lastTime = 0
    function render(time) {
        time /= 1000 //get it into seconds and not milliseconds
        let deltaTime = time - lastTime
        lastTime = time

        testObject.rotY += deltaTime
        testObject.rotZ += deltaTime

        // update the camera
        camera.update(deltaTime)
        const cameraMatrix = camera.getCameraMatrix(canvas.clientWidth / canvas.clientHeight)
        device.queue.writeBuffer(cameraUniformBuffer, 0, cameraMatrix.buffer, cameraMatrix.byteOffset, cameraMatrix.byteLength)

        // ---------- RASTERIZING THE SCENE ----------
        const rasterizeCommandEncoder = device.createCommandEncoder()
        const rasterizeRenderPass = rasterizeCommandEncoder.beginRenderPass(rasterizePassDescriptor)

        scene.draw(rasterizeRenderPass) //draws the scene to the rasterizer targets

        rasterizeRenderPass.end()
        device.queue.submit([rasterizeCommandEncoder.finish()])

        // ---------- TEXTURING THE SCENE ----------
        const textureCommandEncoder = device.createCommandEncoder()
        const textureRenderPass = textureCommandEncoder.beginRenderPass(textureRenderPassDescriptor)
        textureRenderPass.setPipeline(texturePipeline)
        textureRenderPass.setBindGroup(0, textureBindGroup)
        textureRenderPass.draw(6)
        textureRenderPass.end()

        device.queue.submit([textureCommandEncoder.finish()])

        // ---------- DISPLAYING THE SCENE ----------
        displayRenderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()
        const displayCommandEncoder = device.createCommandEncoder()
        const displayRenderPass = displayCommandEncoder.beginRenderPass(displayRenderPassDescriptor)
        displayRenderPass.setPipeline(displayPipeline)
        displayRenderPass.setBindGroup(0, displayBindGroup)
        displayRenderPass.draw(6)
        displayRenderPass.end()

        device.queue.submit([displayCommandEncoder.finish()])


        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

main()