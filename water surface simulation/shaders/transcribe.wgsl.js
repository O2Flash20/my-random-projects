export default /*wgsl*/ `

@group(0) @binding(0) var outputTexture: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var originalTexture: texture_2d<f32>;

@compute @workgroup_size(1) fn transcribeTexture(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let i = id.xy;

    let originalValue = textureLoad(originalTexture, i, 0).r;

    textureStore(
        outputTexture, i, 
        vec4f(
            originalValue,
            -originalValue,
            0,
            1
        )
    );
}

`