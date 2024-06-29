async function approximateSeries(sequence, seriesStart, seriesEndCubed) {
    // set up the device (gpu)
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
        alert("need a browser that supports WebGPU")
        return
    }

    const sequenceModule = device.createShaderModule({
        label: "sequence calculator compute module",
        code: /*wgsl*/ `


        @group(0) @binding(0) var<storage, read_write> data: array<f32>; //declaring a variable data of type storage that we want to read and write to, an array of 32-bit floats. this goes in binding location 0 in bindGroup 0

        fn i32_pow(base:i32, exp:i32)->i32{
            var output:i32 = 1;
            for (var i:i32=0; i<exp; i++){
                output *= base;
            }
            return output;
        }

        @compute @workgroup_size(1) fn computeSequence( //@compute makes it a compute shader
            @builtin(global_invocation_id) id: vec3<u32> //this is the iteration's id, a 3d vector since compute shaders can understand 3d
        ) {
            const idDimensions = ${seriesEndCubed};
            let oneDIndex = id.x*idDimensions*idDimensions+id.y*idDimensions+id.z;
            let n = f32(oneDIndex + ${seriesStart});
            data[oneDIndex] = ${sequence};
        }


        `
    })

    const sequencePipeline = device.createComputePipeline({
        label: "sequence calculator compute pipeline",
        layout: "auto",
        compute: {
            module: sequenceModule
        }
    })

    const workArray = new Float32Array(seriesEndCubed ** 3)
    const workBuffer = device.createBuffer({
        label: "work buffer",
        size: workArray.byteLength,
        usage: GPUBufferUsage.STORAGE /*needed to be compatible with var<storage>*/ | GPUBufferUsage.COPY_SRC /*want to copy data from it*/ | GPUBufferUsage.COPY_DST /*want to copy data to it*/
    })

    const sequenceBindGroup = device.createBindGroup({
        label: "bindGroup for only the work buffer",
        layout: sequencePipeline.getBindGroupLayout(0), //0 from @group(0) in the shader
        entries: [
            { binding: 0, resource: { buffer: workBuffer } } //0 from @binding(0) in the shader
        ]
    })

    // encode the commands to do the computation
    const passEncoder = device.createCommandEncoder({
        label: "series calculator encoder"
    })
    const pass = passEncoder.beginComputePass({
        label: "series calculator compute pass"
    })
    pass.setPipeline(sequencePipeline)
    pass.setBindGroup(0, sequenceBindGroup) //0 corresponds to @group(0) in the shader
    pass.dispatchWorkgroups(seriesEndCubed, seriesEndCubed, seriesEndCubed) //run the computer shader as many times as there are input numbers

    const sumModule = device.createShaderModule({
        label: "sum calculator compute module",
        code: /*wgsl*/ `


            struct Uniforms{
                stride: u32,
                numInvocations: u32
            };

            @group(0) @binding(0) var<storage, read_write> data: array<f32>;
            @group(0) @binding(1) var<uniform> u:Uniforms;

            @compute @workgroup_size(1) fn computeSum(
                @builtin(global_invocation_id) id:vec3<u32>
            ){
                var thisIndex = id.x*u.numInvocations*u.numInvocations+id.y*u.numInvocations+id.z;
                thisIndex *= u.stride*2;  //make it line up with the original buffer according to stride. if stride is 1, every other entry is added. if stride is 2, every other is skipped and the next is added
                data[thisIndex] = data[thisIndex]+data[thisIndex+u.stride];
            }


    `
    })

    const sumPipeline = device.createComputePipeline({
        label: "sum calculator compute pipeline",
        layout: "auto",
        compute: {
            module: sumModule
        }
    })

    pass.setPipeline(sumPipeline)

    // "reduce" the buffer numSteps amount of times until the first element is the sum of the entire thing
    const numSteps = Math.ceil(Math.log2(seriesEndCubed ** 3)) //it will take this many steps to reduce the total number of sequence terms
    for (let i = 0; i < numSteps; i++) {
        const sumUniformArray = new Uint32Array(2)
        const thisStride = 2 ** i
        const sumWorkgroupsSize = Math.ceil(seriesEndCubed / Math.pow(thisStride * 2, 1 / 3)) //the workgroups are called as a cube, this finds the dimensions of the cube needed to have enough to sum the entire buffer
        sumUniformArray.set([thisStride, sumWorkgroupsSize])

        const sumUniformBuffer = device.createBuffer({
            size: 8,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })
        device.queue.writeBuffer(sumUniformBuffer, 0, sumUniformArray)

        const sumBindGroup = device.createBindGroup({
            label: `bindGroup for the sum shader: work buffer and stride number, stride number ${thisStride}`,
            layout: sumPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: workBuffer } },
                { binding: 1, resource: { buffer: sumUniformBuffer } }
            ]
        })

        pass.setBindGroup(0, sumBindGroup)
        pass.dispatchWorkgroups(sumWorkgroupsSize, sumWorkgroupsSize, sumWorkgroupsSize)
    }

    pass.end()

    // if a buffer has a STORAGE usage, it can't be mapped to something back in javascript, so we need another buffer to store the results we can read
    const resultBuffer = device.createBuffer({
        label: "result buffer",
        size: workArray.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    })

    // now that the computation is finished, copy from workBuffer to resultBuffer so that the data can be read
    passEncoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size)
    // and finally submit all the commands
    const commandBuffer = passEncoder.finish()
    device.queue.submit([commandBuffer])

    // read the results
    await resultBuffer.mapAsync(GPUMapMode.READ) //when its ready to be read
    const result = new Float32Array(resultBuffer.getMappedRange().slice()) //nothing in the brackets means map the entire thing
    resultBuffer.unmap()
    // after this, the data that was in resultBuffer is gone

    const sum = result[0]
    let bestResults = { calculated: sum, percentDifference: 10000 }
    for (let i = 0; i <= 3; i++) {
        for (let j = 1; j <= 50; j++) {
            const testValue = j * sum / (Math.PI ** i)
            const exactValue = Math.PI ** i * Math.round(testValue) / j
            const percentDifference = Math.abs(Math.abs(sum - exactValue) / ((sum + exactValue) / 2) * 100)
            //    if this is so far the best one                   v  and its not equivalent to the last one (ex 1/6 = 2/12)
            if (percentDifference < bestResults.percentDifference && Math.abs(percentDifference - bestResults.percentDifference) > 0.0001) {
                console.log(percentDifference)
                bestResults = {
                    calculated: sum,
                    piExponent: i,
                    numerator: Math.round(testValue),
                    demonimator: j,
                    percentDifference: percentDifference
                }
            }
        }
    }
    return bestResults
}

document.getElementById("cubeRootEndN").addEventListener("change", (event) => {
    document.getElementById("endNDisplay").innerText = document.getElementById("cubeRootEndN").value ** 3
})

// when the user clicks "Calculate"
document.getElementById("calculateButton").addEventListener("click", async function () {
    const calculationResults = await approximateSeries(
        document.getElementById("termsSequence").value,
        Number(document.getElementById("startN").value),
        Number(document.getElementById("cubeRootEndN").value)
    )

    console.log(calculationResults)

    const elt = document.getElementById("resultPretty")
    let string = "$${\\sum\\limits_{"
    string += "n=" + document.getElementById("startN").value + "}"
    string += "^{" + document.getElementById("endNDisplay").innerText + "}"
    string += "a_n = "
    string += calculationResults.calculated

    if (Math.abs(calculationResults.percentDifference) < 1) {
        string += "\\approx"

        if (calculationResults.demonimator == 1) {
            string += calculationResults.numerator
        } else {
            string += "\\frac{" + calculationResults.numerator + "}{" + calculationResults.demonimator + "}"
        }
        if (calculationResults.piExponent !== 0) {
            if (calculationResults.piExponent == 1) {
                string += "\\pi"
            } else {
                string += "\\pi^{" + calculationResults.piExponent + "}"
            }
        }
    }


    string += "}$$"
    elt.innerText = string
    MathJax.Hub.Queue(["Typeset", MathJax.Hub])
})