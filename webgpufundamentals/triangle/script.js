
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

    // create a shader module
    const module = device.createShaderModule({
        label: "hardcoded red triangle shaders", // useful to have labels for errors and stuff
        code: /* wgsl */`
            @vertex fn vs(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f { //take in the vertex index and return the position of the vertex with that index
                let pos = array(
                    vec2f(0.0, 0.5), //top center
                    vec2f(-0.5, -0.5), //bottom left
                    vec2f(0.5, -0.5)  //bottom right
                );

                return vec4f(pos[vertexIndex], 0.0, 1.0); //it needs to return a vec4, so just fill it with whatever
            }

            @fragment fn fs() -> @location(0) vec4f{
                return vec4f(1.0, 0.0, 0.0, 1.0);
            }
    `
    })

    // create the render pipeline
    const pipeline = device.createRenderPipeline({
        label: "hardcoded red triangle pipeline",
        layout: "auto",
        vertex: {
            entryPoint: "vs", //the main function in the vertex code
            module,
        },
        fragment: {
            entryPoint: "fs", //the main function in the fragment code
            module,
            targets: [{ format: presentationFormat }] //element 0 of array is location(0) in the fragment shader output
        }
    })

    // create a render pass descriptor
    const renderPassDescriptor = {
        label: "basic canvas render pass",
        colorAttachments: [
            {
                // view: <- to be filled out when we render
                clearValue: [0.3, 0.3, 0.3, 1], //the color of transparent
                loadOp: 'clear', //operation on load: clear the texture. the other option is "load" which draws on top
                storeOp: 'store', //store what we draw
            }
        ]
    }

    function render() {
        // get the current texture from the canvas context and set it as the texture to render to
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView() //element 0 of colorAttachments is @location(0) once again

        // make a command encoder to start encoding commands
        const encoder = device.createCommandEncoder({ label: "encoder" })

        // make a render pass encoder to encode render specific commands
        const pass = encoder.beginRenderPass(renderPassDescriptor)
        pass.setPipeline(pipeline)
        pass.draw(3) //call the vertex shader 3 times for the 3 vertices. by default, every 3 times the vertex shader is called it draws a triangle between those vertices
        pass.end()

        const commandBuffer = encoder.finish()
        device.queue.submit([commandBuffer])
    }

    render()
}
main()

