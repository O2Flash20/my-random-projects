export default /*wgsl*/ `

@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var textureScaled: texture_storage_2d<r32float, write>;

const scale = _SCALE;

fn linearMix(a: f32, v1: f32, v2: f32) -> f32 {
    return (1-a)*v1 + a*v2;
}

@compute @workgroup_size(1) fn upscale(
    @builtin(global_invocation_id) id: vec3u
) {
    let i = id.xy;
    let nearestInSmall = vec2u(floor(vec2f(i)/f32(scale)));

    let offset = i - nearestInSmall*scale;

    let mix = vec2f(offset)/scale;

    let center = textureLoad(texture, nearestInSmall, 0).r;
    let top = textureLoad(texture, nearestInSmall+vec2u(0, 1), 0).r;
    let right = textureLoad(texture, nearestInSmall+vec2u(1, 0), 0).r;
    let topRight = textureLoad(texture, nearestInSmall+vec2u(1, 1), 0).r;

    let v1 = linearMix(mix.x, center, right);
    let v2 = linearMix(mix.x, top, topRight);
    let v = linearMix(mix.y, v1, v2);

    textureStore(textureScaled, i, vec4f(v));
}

`