export default /*wgsl*/ `

@group(0) @binding(0) var distanceTexture: texture_2d<f32>;
@group(0) @binding(1) var groundHeightTexture: texture_storage_2d<r32float, write>;

fn f(x: f32) -> f32 {
    return (1/3.14159265)*(atan(x - 4) + 1.35);
}

@compute @workgroup_size(1) fn getHeight(
    @builtin(global_invocation_id) id: vec3u
) {
    let distance = textureLoad(distanceTexture, id.xy, 0).r;

    var height = 0.;
    if (distance > 0) {
        height = -distance/100;
    }
    else {
        let d = -distance / 10;
        height = f(d);
    }

    textureStore(groundHeightTexture, id.xy, vec4f(200*height, 0, 0, 0));
}

`