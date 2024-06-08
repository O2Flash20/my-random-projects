export default /*wgsl*/ `

struct textureSizes {
    worleyTextureSize: u32,
    pointsGridTextureSize: u32
}

@group(0) @binding(0) var<uniform> texSizes: textureSizes;
@group(0) @binding(1) var worleyTexture: texture_storage_3d<rgba8unorm, write>;
@group(0) @binding(2) var pointsGridTexture: texture_storage_3d<rgba8unorm, read>;

@compute @workgroup_size(1) fn generateWorleyNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    // textureStore(worleyTexture, id, vec4f(sin(f32(id.x/5+id.z))));
    // textureStore(worleyTexture, id, vec4f(1., 0., 1., 1.));

    //* still working on this, error from here
    textureStore(worleyTexture, id, textureSample(pointsGridTexture, vec3u(vec3f(id)/f32(texSizes.worleyTextureSize) * f32(texSizes.pointsGridTextureSize)), 0));
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
*/