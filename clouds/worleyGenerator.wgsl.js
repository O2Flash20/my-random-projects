export default /*wgsl*/ `

struct textureSizes {
    worleyTextureSize: u32,
    pointsGridTextureSize: u32
}

@group(0) @binding(0) var<uniform> texSizes: textureSizes;
@group(0) @binding(1) var worleyTexture: texture_storage_3d<rgba8unorm, write>;
@group(0) @binding(2) var pointsGridTexture: texture_3d<f32>;

@compute @workgroup_size(1) fn generateWorleyNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let texSizeRatio = f32(texSizes.worleyTextureSize) / f32(texSizes.pointsGridTextureSize); //should be a number > 1
    let thisGridCell = vec3u( vec3f(id) / texSizeRatio ); //get the cell of this sample point
    let thisPosInGrid = (vec3f(id) % texSizeRatio) / texSizeRatio; // [0, 1]

    var closestDist = 10000000.;
    for (var i = -1; i <= 1; i++){
        for (var j = -1; j <= 1; j++){
            for (var k = -1; k <= 1; k++){
                // the cell that this point is in
                let pointCell = vec3u((vec3i(thisGridCell) + vec3i(i, j, k)) % i32(texSizes.pointsGridTextureSize));
                //get the point's offset from pointsGridTexture
                let pointPosInItsCell = textureLoad(pointsGridTexture, pointCell, 0).rgb;
                //get the point's position relative to the start of the cell that the sample is in, if one cell is 1u across
                let pointPosRelativeToSampleCell = pointPosInItsCell + vec3f(vec3i(i, j, k));

                let thisDist = distance(thisPosInGrid, pointPosRelativeToSampleCell);
                if (thisDist < closestDist){
                    closestDist = thisDist;
                }
            }
        }
    }

    textureStore(
        worleyTexture,
        id,
        vec4f(1. - closestDist, 0., 0., 1.)
    );

    // textureStore(
    //     worleyTexture,
    //     id,
    //     textureLoad(
    //         pointsGridTexture, 
    //         vec3u(
    //             vec3f(id) / f32(texSizes.worleyTextureSize) * f32(texSizes.pointsGridTextureSize)
    //         ),
    //         0
    //     )
    // );
}

`

/*
for each level of noise:
    set up a 3d grid of a certain density
    in each cell of the grid, randomly place a point
        this could be done with a different 3d image texture, where each grid cell is a pixel and the color in rgb is the position within the cell
    then for each pixel look at the grid it's in and the 26 others around it
        if this grid cell is on the edge the ones off the edge are wrapped around to the other side to make the texture tileable
    write the distance to the nearest point
then do a few more levels of noise with different grid densities
add the levels together as some series which converges to 1

4 levels of noise, 4 colour channels in the texture
later, all those channels get added together
*/