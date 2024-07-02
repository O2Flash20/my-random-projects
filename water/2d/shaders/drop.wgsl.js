export default /*wgsl*/ `

struct dropInfo {
    position: vec2u,
    strength: f32,
    size:f32,
    upDownRatio:f32
};

@group(0) @binding(0) var<uniform> params:dropInfo;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;
@group(0) @binding(2) var outputTexture: texture_storage_2d<r32float, write>;

fn getDensityValue(distance:f32, strength:f32, size:f32, upDownRatio:f32) -> f32{
    let upSize = upDownRatio * size;

    if (0 <= distance && distance < (upDownRatio * size)){
        return -strength / (upSize*upSize) * (distance-upSize) * (distance + upSize);
    }
    else{
        let b = 3./2. * (upSize*upSize*strength/(size*size*size*size/2. - upSize*size*size*size - upSize*upSize*upSize*upSize/2. + size*upSize*upSize*upSize));
        return b * (distance-upSize) * (distance-size);
    }
}

@compute @workgroup_size(1) fn addDrop(
    @builtin(global_invocation_id) id: vec3<u32>
){
    let dist = distance(vec2f(params.position), vec2f(f32(id.x), f32(id.y)));
    let oldDensity = textureLoad(inputTexture, id.xy, 0).r;
    if (dist <= params.size){
        textureStore(
            outputTexture, 
            id.xy,
            vec4f(oldDensity + getDensityValue(dist, params.strength, params.size, params.upDownRatio)) //needs to be vec4f but .r is all that actually matters
        );
    }
}

`