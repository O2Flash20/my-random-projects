export default /*wgsl*/ `

@group(0) @binding(0) var groundHeightTexture: texture_2d<f32>;
@group(0) @binding(1) var sunShadowsTexture: texture_storage_3d<rgba8unorm, write>;

const sunDir = vec3f(0, 0.707106, 0.707106);

@compute @workgroup_size(1) fn sunShadows(
    @builtin(global_invocation_id) id: vec3u
) {
    let thisGroundHeight = textureLoad(groundHeightTexture, id.xy, 0).r;

    // randomly offset the sun dir vector based on id.z
    // step through the ground height texture to find if you hit terrain on the way to the sun
    // if hit terrain, return 0, else return sun colour

    let step = sunDir/length(sunDir.xy);

    textureStore(sunShadowsTexture, id, vec4f(0));
}

`