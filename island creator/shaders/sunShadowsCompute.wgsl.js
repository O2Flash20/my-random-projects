export default /*wgsl*/ `

@group(0) @binding(0) var groundHeightTexture: texture_2d<f32>;
@group(0) @binding(1) var sunShadowsTexture: texture_storage_3d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> time: f32;

// * these should be passed in from the cpu
const sunDir = normalize(vec3f(_SUNDIR));
const numSunSamples = _NUMSAMPLES;

const groundHeightTextureSize = _GSIZE;
const shadowsTextureSize = _SSIZE;

const pi = 3.1415926535;

fn guideVectorRotation(v: vec3f, g: vec3f) -> vec3f {
    let G = length(g);
    let Gxy = length(g.xy);

    return vec3f(
        v.x * ((g.x*g.z)/(G*Gxy)) + v.z*(g.x/G) - v.y*(g.y/Gxy),
        v.x * ((g.y*g.z)/(G*Gxy)) + v.z*(g.y/G) + v.y*(g.x/Gxy),
        -v.x*(Gxy/G) + v.z*(g.z/G)
    );
}

fn getRandomSunDir(amplitude: f32, numSamples: u32, n: u32) -> vec3f {
    let nf32 = f32(n);

    let f = (0.025+0.002*sin(10*time))*f32(numSamples);

    let V = vec3f(
        amplitude * nf32/(2*pi) * cos(2*pi*f*nf32 + 100*time),
        amplitude * nf32/(2*pi) * sin(2*pi*f*nf32 + 100*time),
        1
    );

    let v = V/length(V);

    return guideVectorRotation(v, sunDir);
}

@compute @workgroup_size(1) fn sunShadows(
    @builtin(global_invocation_id) id: vec3u
) {
    let S = u32(groundHeightTextureSize/shadowsTextureSize);

    let thisGroundHeight = max(textureLoad(groundHeightTexture, id.xy*S, 0).r, 0);

    let thisSunDir = getRandomSunDir(0.05, numSunSamples, id.z);
    let step = 10 * thisSunDir;

    var sample = vec3f(vec2f(id.xy*S), thisGroundHeight);

    sample += step/(0.5*sin(time)+1.5);

    var light = 1.;
    while (sample.z <= 200 && sample.x > 0 && sample.y > 0 && u32(sample.x) < groundHeightTextureSize && u32(sample.y) < groundHeightTextureSize) {
        sample += step;

        let sampleGroundHeight = textureLoad(groundHeightTexture, vec2u(sample.xy), 0).r;
        if (sample.z < sampleGroundHeight) {
            light = 0;
            break;
        }
    }

    textureStore(sunShadowsTexture, id, vec4f(light));
}

`