export default /*wgsl*/ `

@group(0) @binding(0) var inputTexture: texture_2d<u32>;
@group(0) @binding(1) var drawTexture: texture_2d<u32>;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn convert(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let value = vec4f(textureLoad(inputTexture, id.xy, 0));
    let drawValue = vec4f(f32(textureLoad(drawTexture, id.xy, 0).r));
    var undefined = value.r == 513;
    if (undefined) {
        textureStore(outputTexture, id.xy, vec4f(0, 0, 1, 1));
    }
    else {
        textureStore(outputTexture, id.xy, vec4f(value.r/512, value.g/512, 0, 1)+drawValue);
    }
}

`