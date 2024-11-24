export default /*wgsl*/ `

@group(0) @binding(0) var drawTexture: texture_2d<u32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rg32uint, write>;

const imageSize = _IS;

@compute @workgroup_size(1) fn draw(
    @builtin(global_invocation_id) id:vec3u
){
    let i = id.xy;
    let thisIsSolid = textureLoad(drawTexture, i, 0).r == 1;
    if (thisIsSolid) {
        if (
            textureLoad(drawTexture, i + vec2u(1, 0), 0).r == 1 &&
            textureLoad(drawTexture, i + vec2u(0, 1), 0).r == 1 &&
            textureLoad(drawTexture, vec2i(i) + vec2i(-1, 0), 0).r == 1 &&
            textureLoad(drawTexture, vec2i(i) + vec2i(0, -1), 0).r == 1
        ) {
            textureStore(outputTexture, i, vec4u(imageSize+1));
        }
        else {
            textureStore(outputTexture, i, vec4u(i.x, i.y, 0, 0));
        }
    }
    else {
        textureStore(outputTexture, i, vec4u(imageSize+1));
    }
}

`