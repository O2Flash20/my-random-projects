// converts the distances to rgba colors to be displayed

export default /*wgsl*/ `

@group(0) @binding(0) var distance: texture_2d<f32>;
@group(0) @binding(1) var normal: texture_2d<f32>;
@group(0) @binding(2) var<uniform> time: f32;
@group(0) @binding(3) var noise: texture_2d<f32>;
@group(0) @binding(4) var outputTexture: texture_storage_2d<rgba8unorm, write>;

fn colorMix(v: f32, col1: vec3f, col2: vec3f) -> vec3f {
    let mixFactor = -2*v*v*v+3*v*v;
    return (1-mixFactor)*col1 + mixFactor*col2;
}

fn mapRange(v: f32, minIn: f32, maxIn: f32, minOut: f32, maxOut: f32) -> f32 {
    return (maxOut-minOut)*(v-minIn)/(maxIn-minIn)+minOut;
}

fn colorMix3(v: f32, colors: array<vec4f, 3>) -> vec3f {
    var col = colors[0].rgb;
    for (var i = 0; i < 3-1; i++) {
        if (v >= colors[i][3] && v < colors[i+1][3]){
            let mix = mapRange(v, colors[i][3], colors[i+1][3], 0, 1);
            col = colorMix(mix, colors[i].rgb, colors[i+1].rgb);
            break;
        }
    }
    if (v >= colors[3-1][3]) {col = colors[3-1].rgb;}
    return col;
}

fn colorMix6(v: f32, colors: array<vec4f, 6>) -> vec3f {
    var col = colors[0].rgb;
    for (var i = 0; i < 6-1; i++) {
        if (v >= colors[i][3] && v < colors[i+1][3]){
            let mix = mapRange(v, colors[i][3], colors[i+1][3], 0, 1);
            col = colorMix(mix, colors[i].rgb, colors[i+1].rgb);
            break;
        }
    }
    if (v >= colors[6-1][3]) {col = colors[6-1].rgb;}
    return col;
}

fn getHeight(samplePos: vec2u) -> f32 {
    let dist = textureLoad(distance, samplePos, 0).r;

    if (dist < 0) {
        return pow(-dist/5, 3);
    }
    else {
        return 0;
    }
}

@compute @workgroup_size(1) fn convert(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let dist = textureLoad(distance, id.xy, 0).r;
    let isInside = dist < 0;

    let t = time;

    let n = normalize(vec3f(textureLoad(normal, id.xy, 0).rg, 1));

    let sunDir = normalize(vec3f(sin(0.5*time), cos(0.5*time), 1));

    let sunIllumination = 0.5*clamp(dot(n, sunDir), 0, 1)+0.5;

    var col = vec3f(0);

    if (isInside) {
        col = colorMix6(
            -dist,
            array<vec4f, 6>(
                vec4f(1, 1, 0.7, 3),
                vec4f(0.2, 0.8, 0.1, 7),
                vec4f(0, 0.7, 0, 120),
                vec4f(0.5, 0.5, 0.5, 135),
                vec4f(1, 1, 1, 220),
                vec4f(1, 1, 1, 221),
            )
        );
    }
    else {
        var waterColMix = clamp(dist/50, 0, 1);
        waterColMix = 1-pow(1-waterColMix, 2);
        let waterCol = colorMix(waterColMix, vec3f(0, 0.8, 0.467), vec3f(0, 0.1, 0.6));

        var waveAmount = 0.;
        let waveMaxDist = 20.;
        var waveCrest = 0.;
        if (dist < waveMaxDist) {
            let d = dist/waveMaxDist;

            let offsetAmount = 10*d+1;
            let sampleOffset = vec2u(2*offsetAmount*textureLoad(noise, id.xy, 0).rg-offsetAmount);
            let waveSample = id.xy+sampleOffset;

            let waveDist = textureLoad(distance, waveSample, 0).r;
            let wd = waveDist/waveMaxDist;
            waveAmount = wd*wd-2*wd+1;
            waveCrest = waveAmount*0.5*(sin(2*waveDist+2*time)+1);
        }
        // col = waterCol+pow(waveCrest, 2);
        col = colorMix(pow(waveCrest, 2), waterCol, vec3f(1.6));
    }

    let shadowSampleStep = sunDir/(length(sunDir.xy));
    var h = vec3f(vec2f(id.xy), getHeight(id.xy)+2);
    var isInShadow = false;
    for (var i = 0; i < 100; i++) {
        h += shadowSampleStep;
        if (h.z < getHeight(vec2u(h.xy))) {
            isInShadow = true;
            break;
        }
    }

    var shadowDarkening = 1.;
    if (isInShadow) {shadowDarkening = 0.2;}

    textureStore(outputTexture, id.xy, shadowDarkening*vec4f(col, 1));
}

`