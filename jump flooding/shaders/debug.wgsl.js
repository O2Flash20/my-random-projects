export default /*wgsl*/ `

@group(0) @binding(0) var inputTexture: texture_2d<u32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn convert(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let value = vec4f(textureLoad(inputTexture, id.xy, 0));
    textureStore(outputTexture, id.xy, vec4f(value.r/100, value.g/100, 0, 1));
}

`