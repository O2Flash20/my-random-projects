export default /*wgsl*/ `

@group(0) @binding(0) var fbmTexture: texture_storage_3d<rgba8unorm, write>;
@group(0) @binding(1) var valueTexture: texture_3d<f32>;

// probably should have used a fragment shader so i didnt have to make my own trilinear interpolation function lol https://en.wikipedia.org/wiki/Trilinear_interpolation

const textureSize = 128.;

fn tLoadRepeat(texture: texture_3d<f32>, coord: vec3i, scale: f32) -> vec4f {
    return textureLoad(texture, vec3u(coord) % u32(textureSize/scale), 0);
}

fn linearSampleTexture(texture: texture_3d<f32>, coord: vec3f, scale: f32) -> vec4f {
    let interp = fract(coord/scale);

    let ci = vec3i(coord/scale);

    let c00 = tLoadRepeat(texture, ci+vec3i(0, 0, 0), scale)*(1. - interp.x) + tLoadRepeat(texture, ci+vec3i(1, 0, 0), scale)*interp.x;
    let c01 = tLoadRepeat(texture, ci+vec3i(0, 0, 1), scale)*(1. - interp.x) + tLoadRepeat(texture, ci+vec3i(1, 0, 1), scale)*interp.x;
    let c10 = tLoadRepeat(texture, ci+vec3i(0, 1, 0), scale)*(1. - interp.x) + tLoadRepeat(texture, ci+vec3i(1, 1, 0), scale)*interp.x;
    let c11 = tLoadRepeat(texture, ci+vec3i(0, 1, 1), scale)*(1. - interp.x) + tLoadRepeat(texture, ci+vec3i(1, 1, 1), scale)*interp.x;

    let c0 = c00*(1. - interp.y) + c10*interp.y;
    let c1 = c01*(1. - interp.y) + c11*interp.y;

    return c0 * (1. - interp.z) + c1*interp.z;
}

@compute @workgroup_size(1) fn generateFBMNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let idf = vec3f(id);

    textureStore(
        fbmTexture,
        id,
        vec4f(
            0.5*linearSampleTexture(valueTexture, idf, 16).r + 0.25*linearSampleTexture(valueTexture, idf, 8).g + 0.125*linearSampleTexture(valueTexture, idf, 4).b + 0.0625*linearSampleTexture(valueTexture, idf, 2).a,
            0., 0., 0.
        )
    );
}

`