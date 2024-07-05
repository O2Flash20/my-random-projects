export default /*wgsl*/ `

@group(0) @binding(0) var fbmTexture: texture_3d<f32>;
@group(0) @binding(1) var worleyTexture: texture_3d<f32>;
@group(0) @binding(2) var fbmwTexture: texture_storage_3d<rgba8unorm, write>;

@compute @workgroup_size(1) fn generateFBMWNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let fbmValue = textureLoad(fbmTexture, id, 0);
    let worleyValue = textureLoad(worleyTexture, id, 0);
    textureStore(fbmwTexture, id, vec4f(
        0.7*fbmValue.r + 0.3*worleyValue.r,
        worleyValue.g,
        worleyValue.b,
        worleyValue.a
    ));
}

`