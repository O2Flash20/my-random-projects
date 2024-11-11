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

@group(0) @binding(0) var linearSampler: sampler;
@group(0) @binding(1) var materialTexture: texture_2d<u32>;
@group(0) @binding(2) var normalTexture: texture_2d<f32>;
@group(0) @binding(3) var uvTexture: texture_2d<f32>;

_TEXTURE_INPUT

struct FragmentOutput{
    @location(0) color: vec4f,
    @location(1) normal: vec4f,
    @location(2) roughness: f32,
    @location(3) metallic: f32
}

@fragment fn f(i: VertexOutput) -> FragmentOutput {
    let pixel = vec2u(vec2f(textureDimensions(materialTexture)) * i.uv);
    var output: FragmentOutput;

    let material = textureLoad(materialTexture, pixel, 0).r;
    let normal = textureLoad(normalTexture, pixel, 0).rgb; //normals before normal map
    let uv = textureLoad(uvTexture, pixel, 0).rg;

_TEXTURE_SAMPLE

_MATERIALS

    return output;
}

`