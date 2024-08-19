const thresholdValue = 0.75

export default /*wgsl*/ `

@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn updateWave(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let i = vec2i(id.xy);

    var shouldBeWhite = false;
    for (var j = -1; j <= 1; j++) {
        for (var k = -1; k <= 1; k++) {
            shouldBeWhite = shouldBeWhite || textureLoad(inputTexture, i+vec2i(j, k), 0).r > ${thresholdValue};
        }
    }

    let inputValue = textureLoad(inputTexture, i, 0).r;

    var outputValue = 0.;
    if (shouldBeWhite) {
        outputValue = 1.;
    }

    textureStore(outputTexture, i, vec4f(outputValue));
}

`