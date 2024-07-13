export default /*wgsl*/ `

struct textureSizes {
    worleyTextureSize: u32,
    pointsGridTextureSize: u32
}

@group(0) @binding(0) var<uniform> texSizes: textureSizes;
@group(0) @binding(1) var worleyTexture: texture_storage_3d<rgba8unorm, write>;
@group(0) @binding(2) var pointsGridTexture: texture_3d<f32>;

// pointsGridTextureSize should be divisible by scale
fn worleyLayer(scale:u32, id:vec3u) -> f32 {
    let texSizeRatio = f32(texSizes.worleyTextureSize) / f32(texSizes.pointsGridTextureSize / scale); //should be a number > 1
    let thisGridCell = vec3u( vec3f(id) / texSizeRatio ); //get the cell of this sample point
    let thisPosInGrid = (vec3f(id) % texSizeRatio) / texSizeRatio; // [0, 1]

    var closestDist = 10000000.;
    // the closest point might also be 2 cells away (not diagonal), but maybe i can ignore that :) it doesnt fix tiling
    for (var i = -1; i <= 1; i++){
        for (var j = -1; j <= 1; j++){
            for (var k = -1; k <= 1; k++){
                // the cell that this point is in
                let pointCell = vec3u( (vec3i(thisGridCell) + vec3i(i, j, k)) ) % u32(texSizes.pointsGridTextureSize / scale) ;
                //get the point's offset from pointsGridTexture
                let pointPosInItsCell = textureLoad(pointsGridTexture, pointCell, 0).rgb;
                //get the point's position relative to the start of the cell that the sample is in, if one cell is 1u across
                let pointPosRelativeToSampleCell = pointPosInItsCell + vec3f(vec3i(i, j, k));

                let thisDist = distance(thisPosInGrid, pointPosRelativeToSampleCell); // practically [0, 1]
                if (thisDist < closestDist){
                    closestDist = thisDist;
                }
            }
        }
    }

    return closestDist;
}

// ? one workgroup per color channel to decrease load time?
@compute @workgroup_size(1) fn generateWorleyNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let layer1 = worleyLayer(1, id);
    let layer1Offset1 = worleyLayer(1, id+vec3u(5));
    let layer1Offset2 = worleyLayer(1, id+vec3u(15));
    let layer2 = worleyLayer(2, id);
    let layer3 = worleyLayer(4, id);

    let layeredNoise1 = 0.7*layer3 + 0.175*layer2 + 0.125*layer1;

    textureStore(
        worleyTexture,
        id,
        1 - vec4f(
            layeredNoise1, //in the big texture, this will be overlaid with fbm noise, in the small, it can be ignored
            layeredNoise1,
            0.75*layer2 + 0.25*layer1,
            0.33*layer1 + 0.33*layer1Offset1 + 0.33*layer1Offset2
        )
    );
}

`