const imageSize = 512

export default /*wgsl*/ `

struct uniforms {
    drawMode: u32,
    clickPos: vec2u,
}

@group(0) @binding(0) var<uniform> u: uniforms;
@group(0) @binding(1) var outputTexture: texture_storage_2d<r32uint, write>;

@compute @workgroup_size(1) fn draw(
    @builtin(global_invocation_id) id:vec3u
){
    let i = vec2f(id.xy);

    var drawColor = u32(0);
    if (u.drawMode == 0) {drawColor = 1;}

    // if the user clicked and this pixel is in a certain radius of the click, add density
    if (u.clickPos.x >= 0 && u.clickPos.x < ${imageSize} && u.clickPos.y >= 0 && u.clickPos.y < ${imageSize}){
        if (distance(vec2f(u.clickPos), i) < 14) {
            textureStore(outputTexture, id.xy, vec4u(drawColor));
        }
    }
}

`