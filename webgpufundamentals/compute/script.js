async function main() {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    const module = device.createShaderModule({
        label: "doubling compute module",
        code: /*wgsl*/ `
            @group(0) @binding(0) var<storage, read_write> data: array<f32>; //declaring a variable data of type storage that we want to read and write to, an array of 32-bit floats. this goes in binding location 0 in bindGroup 0

            @compute @workgroup_size(1) fn computeSomething( //@compute makes it a compute shader
                @builtin(global_invocation_id) id: vec3<u32> //this is the iteration's id, a 3d vector since compute shaders can understand 3d
            ) {
                let i = id.x;
                data[i] = data[i] * 2.0;
            }
        `
    })

    const pipeline = device.createComputePipeline({
        label: "doubling compute pipeline",
        layout: "auto",
        compute: {
            module
        }
    })

    const input = new Float32Array([1, 3, 5])

    // the input needs to be passed to the shader through a buffer
    const workBuffer = device.createBuffer({
        label: "work buffer",
        size: input.byteLength,
        usage: GPUBufferUsage.STORAGE /*needed to be compatible with var<storage>*/ | GPUBufferUsage.COPY_SRC /*want to copy data from it*/ | GPUBufferUsage.COPY_DST /*want to copy data to it*/
    })
    // now put the data into the buffer
    device.queue.writeBuffer(workBuffer, 0, input)

    // if a buffer has a STORAGE usage, it can't be mapped to something back in javascript, so we need another buffer to store the results we can read
    const resultBuffer = device.createBuffer({
        label: "result buffer",
        size: input.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    })

    const bindGroup = device.createBindGroup({
        label: "bindGroup for work buffer",
        layout: pipeline.getBindGroupLayout(0), //0 from @group(0) in the shader
        entries: [
            { binding: 0, resource: { buffer: workBuffer } } //0 from @binding(0) in the shader
        ]
    })

    // encode the commands to do the computation
    const encoder = device.createCommandEncoder({
        label: "doubling encoder"
    })
    const pass = encoder.beginComputePass({
        label: "doubling compute pass"
    })
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup) //0 corresponds to @group(0) in the shader
    pass.dispatchWorkgroups(input.length) //run the computer shader as many times as there are input numbers
    pass.end()

    // now that the computation is finished, copy from workBuffer to resultBuffer so that the data can be read
    encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size)
    // and finally submit all the commands
    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])

    // read the results
    await resultBuffer.mapAsync(GPUMapMode.READ) //when its ready to be read
    const result = new Float32Array(resultBuffer.getMappedRange().slice()) //nothing in the brackets means map the entire thing
    resultBuffer.unmap()
    // after this, the data that was in resultBuffer is gone

    console.log("input", input)
    console.log("result", result)
}
main()

