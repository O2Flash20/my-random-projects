export default /*wgsl*/ `

@group(0) @binding(0) var densityTexture: texture_2d<f32>;
@group(0) @binding(1) var displayTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn createDisplayTexture(
    @builtin(global_invocation_id) id: vec3<u32>
){
    let thisDensityValue = textureLoad(densityTexture, id.xy, 0).r;

    textureStore(
        displayTexture, 
        id.xy,
        vec4f(thisDensityValue, 0., -thisDensityValue, 1.)
    );
}


// @group(0) @binding(0) var gradientTexture: texture_2d<f32>;
// @group(0) @binding(1) var displayTexture: texture_storage_2d<rgba8unorm, write>;

// @compute @workgroup_size(1) fn createDisplayTexture(
//     @builtin(global_invocation_id) id: vec3<u32>
// ){
//     var thisGradientValue = textureLoad(gradientTexture, id.xy, 0).rg;
//     if (length(thisGradientValue) > 15) {thisGradientValue = 15*normalize(thisGradientValue);}
//     // if (length(thisGradientValue) < 1.) {thisGradientValue = normalize(thisGradientValue);}

//     textureStore(
//         displayTexture, 
//         id.xy,
//         vec4f(thisGradientValue.x, thisGradientValue.y, -thisGradientValue.x, 1.)
//     );
// }

`
