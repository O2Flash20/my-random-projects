// converts the distances to rgba colors to be displayed

export default /*wgsl*/ `

@group(0) @binding(0) var distancesFloat: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn convert(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let distance = textureLoad(distancesFloat, id.xy, 0).r;
    textureStore(outputTexture, id.xy, vec4f(distance, 0, -distance, 1));
}

`