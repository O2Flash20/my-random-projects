const imageWidth = 100
const imageHeight = 100

export default /*wgsl*/ `

struct pointsInfo {
    numPoints: u32,
    points: array<vec4u, ${imageWidth * imageHeight / 4}> //*remember that each "point" has two points, .xy and .zw
}

@group(0) @binding(0) var<uniform> pI: pointsInfo;
@group(0) @binding(1) var outputTexture: texture_storage_2d<r32float, write>;

@compute @workgroup_size(1) fn jumpFlood(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let uv = vec2f(id.xy) / vec2f(${imageWidth}, ${imageHeight});
    let totalPoints = pI.numPoints;

    textureStore(
        outputTexture,
        id.xy,
        vec4f(
            distance(vec2f(id.xy), vec2f(pI.points[0].zw))/100
        )
    );
}

`