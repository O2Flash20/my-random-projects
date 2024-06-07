export default /*wgsl*/ `

@group(0) @binding(0) var worleyTexture: texture_storage_3d<rgba8unorm, write>;

@compute @workgroup_size(1) fn generateWorleyNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    textureStore(worleyTexture, id, vec4f(sin(f32(id.x/5))));
    // textureStore(worleyTexture, id, vec4f(1., 0., 1., 1.));
};

`