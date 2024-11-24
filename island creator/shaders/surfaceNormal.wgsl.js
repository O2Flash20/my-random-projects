export default /*wgsl*/ `

@group(0) @binding(0) var distance: texture_2d<f32>;
@group(0) @binding(1) var<uniform> time: f32;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rg32float, write>;

fn posToDist(pos: vec2i) -> f32 {
    return textureLoad(distance, pos, 0).r;
}

fn distToHeight(dist: f32) -> f32 {
    const waveDist = 50.;
    if (dist < 0) {
        return pow(-dist/5, 3);
    }
    else {
        if (dist < waveDist) {
            let d = dist/waveDist;
            return 0.5*(d*d-2*d+1) * sin(2*dist + 1.5*time);
        }
        else {
            return 0;
        }
    }
}

@compute @workgroup_size(1) fn getNormal(
    @builtin(global_invocation_id) id: vec3u
) {
    let i = vec2i(id.xy);

    let t = time;

    let rightHeight = distToHeight(posToDist(i+vec2i(1, 0)));
    let leftHeight = distToHeight(posToDist(i+vec2i(-1, 0)));
    let upHeight = distToHeight(posToDist(i+vec2i(0, 1)));
    let downHeight = distToHeight(posToDist(i+vec2i(0, -1)));

    let n = vec2f(
        (rightHeight-leftHeight)/2,
        (upHeight-downHeight)/2
    );

    textureStore(outputTexture, id.xy, vec4f(n, 0, 0));
}

`