export default /*wgsl*/ `

@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<r32float, write>;

const radius = 3;

@compute @workgroup_size(1) fn blur(
    @builtin(global_invocation_id) id: vec3<u32>
){
    var avg = 0.;

    for (var i = -radius; i <= radius; i++){
        for (var j = -radius; j <= radius; j++){
            avg += textureLoad(inputTexture, vec2i(id.xy) + vec2i(i, j), 0).r;
        }
    }

    textureStore(outputTexture, id.xy, vec4f(avg/((2*radius+1)*(2*radius+1))));
}

`