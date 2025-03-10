// converts the distances to rgba colors to be displayed

export default /*wgsl*/ `

@group(0) @binding(0) var<uniform> time: f32;
@group(0) @binding(1) var distanceTexture: texture_2d<f32>;
@group(0) @binding(2) var groundHeightTexture: texture_2d<f32>;
@group(0) @binding(3) var sunShadowsTexture: texture_2d<f32>;
@group(0) @binding(4) var noise: texture_2d<f32>;
@group(0) @binding(5) var outputTexture: texture_storage_2d<rgba8unorm, write>;

const displayScale = _DISPLAYSCALE;

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

@compute @workgroup_size(1) fn convert(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let dist = textureLoad(distanceTexture, id.xy, 0).r;

    let groundHeight = textureLoad(groundHeightTexture, id.xy, 0).r;
    let aboveWater = groundHeight >= 0;

    let t = time;

    let sunDir = normalize(vec3f(sin(0.5*time), cos(0.5*time), 1));

    var col = vec3f(0);

    if (aboveWater) {
        col = colorMix6(
            groundHeight/200,
            array<vec4f, 6>(
                vec4f(1, 1, 0.7, 0.01),
                vec4f(0.2, 0.8, 0.1, 0.02),
                vec4f(0, 0.7, 0, 0.54),
                vec4f(0.5, 0.5, 0.5, 0.61),
                vec4f(1, 1, 1, 0.99),
                vec4f(1, 1, 1, 1),
            )
        );
    }
    else {
        var waterColMix = clamp(dist/50, 0, 1);
        waterColMix = 1-pow(1-waterColMix, 2);
        let waterCol = colorMix(waterColMix, vec3f(0, 0.8, 0.467), vec3f(0, 0.1, 0.6));

        var waveAmount = 0.;
        let waveMaxDist = 50.;
        var waveCrest = 0.;
        if (dist < waveMaxDist) {
            let d = dist/waveMaxDist;

            let offsetAmount = 20*d+1;
            let sampleOffset = vec2i(2*offsetAmount*(textureLoad(noise, id.xy, 0).rg-0.5));
            let waveSample = vec2i(id.xy)+sampleOffset;

            let waveDist = textureLoad(distanceTexture, waveSample, 0).r;
            let wd = waveDist/waveMaxDist;
            waveAmount = wd*wd-2*wd+1;
            waveCrest = waveAmount*0.4*(sin(1.5*waveDist+2*time)+1);
        }
        // col = waterCol+pow(waveCrest, 2);
        col = colorMix(pow(waveCrest, 2), waterCol, vec3f(1.6));
    }

    let sunLight = textureLoad(sunShadowsTexture, id.xy, 0).rgb;
    col *= sunLight;

    textureStore(outputTexture, id.xy, vec4f(col, 1));

    // textureStore(outputTexture, id.xy, vec4f(groundHeight));

    // textureStore(outputTexture, id.xy, textureLoad(sunShadowsTexture, id.xy, 0));
}

`