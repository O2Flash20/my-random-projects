const imageWidth = 256
const imageHeight = 256

export default /*wgsl*/ `

struct uniforms {
    stepSize: u32
}

@group(0) @binding(0) var inputTexture: texture_2d<u32>; //contains pixels with the color of their seed pixel (originally an edge)
@group(0) @binding(1) var outputTexture: texture_storage_2d<r32float, write>;

@compute @workgroup_size(1) fn jumpFlood(
    @builtin(global_invocation_id) id: vec3<u32>
) {

}

`