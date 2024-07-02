export default /*wgsl*/ `

@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var gradientTexture: texture_2d<f32>;

const radius = 5;

@compute @workgroup_size(1) fn shiftDensity(
    @builtin(global_invocation_id) id: vec3<u32>
){
    var value = 0.;

    for (var i = -radius; i <= radius; i++){
        for (var j = -radius; j <= radius; j++){
            var thisGradient = textureLoad(gradientTexture, vec2i(id.xy) + vec2i(i, j), 0).rg;
            if (length(thisGradient) > radius) {thisGradient = radius*normalize(thisGradient);} //make sure it doesn't spread more than the radius allows

            if ( (i32(thisGradient.x) + i32(i) == 0) && i32(thisGradient.y) + i32(j) == 0 ){ // if the gradient at this point being looked at is pointing right at the original, it's density comes here
                value += textureLoad(inputTexture, vec2i(id.xy)+vec2i(i, j), 0).r;
            }

        }
    }

    textureStore(outputTexture, id.xy, vec4f(value));
}

`