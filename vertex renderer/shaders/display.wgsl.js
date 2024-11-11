export default /*wgsl*/ `

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f
};

@vertex fn v(
    @builtin(vertex_index) vertexIndex : u32
) -> VertexOutput {
    let pos = array( //two triangles making a quad that covers the whole screen
        vec2f(-1.0, -1.0),
        vec2f(1.0, -1.0),
        vec2f(-1.0, 1.0),

        vec2f(-1.0, 1.0),
        vec2f(1.0, -1.0),
        vec2f(1.0, 1.0)
    );

    var output: VertexOutput;
    let xy = pos[vertexIndex];
    output.position = vec4f(xy, 0.0, 1.0);
    output.uv = (xy + 1.)/2.;
    output.uv.y = 1-output.uv.y;

    return output;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// @group(0) @binding(0) var linearSampler: sampler;
// @group(0) @binding(1) var materialTexture: texture_2d<u32>;
// @group(0) @binding(2) var normalTexture: texture_2d<f32>;
// @group(0) @binding(3) var uvTexture: texture_2d<f32>;
// @group(0) @binding(4) var depthTexture: texture_depth_2d;

@group(0) @binding(0) var linearSampler: sampler;
@group(0) @binding(1) var uvTexture: texture_2d<f32>;
@group(0) @binding(2) var normalTextureBefore: texture_2d<f32>;
@group(0) @binding(3) var colorTexture: texture_2d<f32>;
@group(0) @binding(4) var normalTexture: texture_2d<f32>;
@group(0) @binding(5) var roughnessTexture: texture_2d<f32>;
@group(0) @binding(6) var metallicTexture: texture_2d<f32>;

@fragment fn f(i: VertexOutput) -> @location(0) vec4f {
    // let pixel = vec2u(vec2f(textureDimensions(materialTexture)) * i.uv);
    // let material = textureLoad(materialTexture, pixel, 0).r;
    // let normal = textureLoad(normalTexture, pixel, 0).rgb;
    // let uv = textureLoad(uvTexture, pixel, 0).rg;
    // let depth = textureSample(depthTexture, linearSampler, i.uv);

    // // materials code gets added here

    // // return vec4f(f32(material)/2, 0, 0,  f32(material));
    // return vec4f(uv, 0, 1);


    let pixel = vec2u(vec2f(textureDimensions(colorTexture)) * i.uv);
    let uv = textureLoad(uvTexture, pixel, 0).rg;
    let normalBefore = textureLoad(normalTextureBefore, pixel, 0).rgb;
    let col = textureSample(colorTexture, linearSampler, i.uv);
    let normal = textureLoad(normalTexture, pixel, 0).rgb;
    let roughness = textureSample(roughnessTexture, linearSampler, i.uv).r;
    let metallic = textureSample(metallicTexture, linearSampler, i.uv).r;

    // return vec4f(normal, 1);
    return col;
}

`