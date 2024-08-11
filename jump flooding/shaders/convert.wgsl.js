// converts the distances to rgba colors to be displayed

export default /*wgsl*/ `

@group(0) @binding(0) var distancesFloat: texture_2d<f32>;
@group(0) @binding(1) var<uniform> time: f32;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn convert(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let distance = textureLoad(distancesFloat, id.xy, 0).r;
    let isInside = distance <= 0;

    var col = vec3f(0);
    if (isInside) {col = vec3f(255, 217, 82)/255;}
    else {col = vec3f(82, 82, 255)/255;}

    col *= 0.375*(sin(distance/2 + 2*time)+1) + 0.25;

    textureStore(outputTexture, id.xy, vec4f(col, 1));
}

`