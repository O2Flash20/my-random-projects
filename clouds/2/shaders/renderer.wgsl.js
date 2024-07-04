export default /*wgsl*/ `

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f
};

@vertex fn vs(
    @builtin(vertex_index) vertexIndex : u32
) -> vertexShaderOutput {
    let pos = array( //two triangles making a quad that covers the whole screen
        vec2f(-1.0, -1.0),
        vec2f(1.0, -1.0),
        vec2f(-1.0, 1.0),

        vec2f(-1.0, 1.0),
        vec2f(1.0, -1.0),
        vec2f(1.0, 1.0)
    );

    var output: vertexShaderOutput;
    let xy = pos[vertexIndex];
    output.position = vec4f(xy, 0.0, 1.0);
    output.uv = (xy + 1.)/2.;

    return output;
};

//-----------------------------------------------------------

struct uniforms {
    time: f32,
    pos: vec3f,
    dir: vec2f,
    projDist: f32
}

@group(0) @binding(0) var<uniform> u: uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var worleyTexture: texture_3d<f32>;

@fragment fn render(fsi:vertexShaderOutput) -> @location(0) vec4f {
    let worleyValue = textureSample(worleyTexture, linearSampler, vec3f(fsi.uv*3., u.time/10));
    return vec4f(vec3f(worleyValue.r), 1.);
}

`