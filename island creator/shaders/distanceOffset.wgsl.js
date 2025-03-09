export default /*wgsl*/ `

@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var offsetTexture: texture_2d<f32>;
@group(0) @binding(2) var outputTexture: texture_storage_2d<r32float, write>;

@compute @workgroup_size(1) fn offsetHeight(
    @builtin(global_invocation_id) id: vec3u
) {
    const offsetAmount = 8;
    textureStore(
        outputTexture, id.xy,
        vec4f(
            textureLoad(inputTexture, id.xy, 0).r + 2*offsetAmount*(textureLoad(offsetTexture, id.xy, 0).r - 0.5)
        )
    );
}

`