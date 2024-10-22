export default /*wgsl*/ `

struct Object { //transformation and rotation of this Object
    transform: mat4x4<f32>, //translate and rotate
    rotate: mat4x4<f32> //rotate only, used for the normals
}

struct Camera{
    matrix: mat4x4<f32> //the transformation matrix from the camera view
}

@group(0) @binding(0) var<uniform> modelTransform: Object;
@group(0) @binding(1) var<uniform> cameraTransform: Camera;

struct VertexInput {
    @location(0) material: u32,
    @location(1) pos: vec3f,
    @location(2) norm: vec3f,
    @location(3) uv: vec2f
}

struct VertexOutput {
    @builtin (position) Position: vec4f,

    @location(0) @interpolate(flat) material: u32,
    @location(1) fragPos: vec3f,
    @location(2) fragNorm: vec3f,
    @location(3) uv: vec2f,
}

@vertex fn v(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var transformedPosition: vec4f = modelTransform.transform * vec4f(input.pos, 1.); //this vertex's position in world space

    output.Position = cameraTransform.matrix * transformedPosition; //this vertex's position in camera space
    output.material = input.material;
    output.fragPos = transformedPosition.xyz;
    output.fragNorm = (modelTransform.rotate * vec4f(input.norm, 1.0)).xyz; //transformed the model's normal to be the normal in world space
    output.uv = input.uv;

    return output;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

struct FragmentInput { //output from the vertex stage
    @builtin (position) Position: vec4f,

    @location(0) @interpolate(flat) material: u32,
    @location(1) fragPos: vec3f,
    @location(2) fragNorm: vec3f,
    @location(3) uv: vec2f,
}

struct FragmentOutput { //output to the various textures the rasterizer is outputting to
    @location(0) material: u32,
    @location(1) normal: vec4f, //the alpha channel is useless (for now) but there's no format for vec3
    @location(2) uv: vec2f
}

@fragment fn f(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    output.material = input.material;
    output.normal = vec4f(input.fragNorm, 0.);
    output.uv = input.uv;

    return output;
}

`