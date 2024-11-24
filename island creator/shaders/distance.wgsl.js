export default /*wgsl*/ `

@group(0) @binding(0) var jfTexture: texture_2d<u32>;
@group(0) @binding(1) var drawTexture: texture_2d<u32>;
@group(0) @binding(2) var distanceTexture: texture_storage_2d<r32float, write>;

const imageSize = _IS;

@compute @workgroup_size(1) fn draw(
    @builtin(global_invocation_id) id:vec3u
){
    let nearestEdge = vec2f(textureLoad(jfTexture, id.xy, 0).xy);

    if (nearestEdge.x == imageSize+1 && nearestEdge.y == imageSize+1) {
        textureStore(distanceTexture, id.xy, vec4f(100)); //if undefined (nothing was drawn yet), set it to be a distance that would show as water 
    }
    else {
        let i = vec2f(id.xy);

        var insideMultiplier = 1.;
        if (textureLoad(drawTexture, id.xy, 0).r == 1) { insideMultiplier = -1.; } //to make pixels that are inside the drawn shape have a negative distance

        textureStore(distanceTexture, id.xy, vec4f(insideMultiplier*distance(i, nearestEdge)));
    }

}

`