// converts the distances to rgba colors to be displayed

export default /*wgsl*/ `

@group(0) @binding(0) var distance: texture_2d<f32>;
@group(0) @binding(1) var normal: texture_2d<f32>;
@group(0) @binding(2) var<uniform> time: f32;
@group(0) @binding(3) var outputTexture: texture_storage_2d<rgba8unorm, write>;

fn colorMix(v: f32, col1: vec3f, col2: vec3f) -> vec3f {
    let mixFactor = -2*v*v*v+3*v*v;
    return (1-mixFactor)*col1 + mixFactor*col2;
}

fn mapRange(v: f32, minIn: f32, maxIn: f32, minOut: f32, maxOut: f32) -> f32 {
    return (maxOut-minOut)*(v-minIn)/(maxIn-minIn)+minOut;
}

fn colorMix5(v: f32, colors: array<vec4f, 6>) -> vec3f {
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
    let d = textureLoad(distance, id.xy, 0).r;
    let isInside = d < 0;

    let t = time;

    let n = normalize(vec3f(textureLoad(normal, id.xy, 0).rg, 1));

    let sunDir = normalize(vec3f(sin(time), cos(time), 1));

    let sunIllumination = 0.5*clamp(dot(n, sunDir), 0, 1)+0.5;

    // textureStore(outputTexture, id.xy, vec4f(n, 1));

    var col = vec3f(0);

    if (isInside) {
        col = colorMix5(
            -d,
            array<vec4f, 6>(
                vec4f(1, 1, 0.7, 3),
                vec4f(0.2, 0.8, 0.1, 7),
                vec4f(0, 0.7, 0, 120),
                vec4f(0.5, 0.5, 0.5, 135),
                vec4f(1, 1, 1, 220),
                vec4f(1, 1, 1, 221),
            )
        );
        // let height = pow(-distance/100, 3);
        // col = vec3f(height);
    }
    else {
        // var waveAmount = 0.;
        // let waveDistance = 200.;
        // var waveCrest = 0.;
        // if (d < waveDistance) {
        //     let d = d/waveDistance;
        //     waveAmount = pow(d*d-2*d+1, 10);
        //     waveCrest = waveAmount*0.5*(sin(d+2*time)+1);
        // }
        // col = vec3f(0, 0, 1)+pow(waveCrest, 1.5);
        col = vec3f(0, 0, 1);
    }

    textureStore(outputTexture, id.xy, sunIllumination*vec4f(col, 1));
}

`