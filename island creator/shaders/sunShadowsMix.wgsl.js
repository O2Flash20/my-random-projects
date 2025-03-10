export default /*wgsl*/ `

@group(0) @binding(0) var sunShadowsComputeTexture: texture_3d<f32>;
@group(0) @binding(1) var sunShadowsTexture: texture_storage_2d<rgba8unorm, write>;

const sunShadowSamples = _SAMPLES;

const finalShadowsTextureSize = _FSIZE;
const shadowsTextureSize = _SSIZE;

@compute @workgroup_size(1) fn mixSunShadows(
    @builtin(global_invocation_id) id: vec3u
) {
    let S = u32(finalShadowsTextureSize/shadowsTextureSize);

    let i = id.xy;

    var totalShadow = vec3f(0);
    for (var j: u32 = 0; j < sunShadowSamples; j++) {
        totalShadow += textureLoad(sunShadowsComputeTexture, vec3u(i/S, j), 0).rgb;
    }
    totalShadow /= f32(sunShadowSamples);

    textureStore(sunShadowsTexture, i, vec4f(totalShadow + 0.1, 1));
}

`