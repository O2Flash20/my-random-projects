export default /*wgsl*/ `

@group(0) @binding(0) var<storage, read> origins: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> positions: array<vec2f>;
@group(0) @binding(2) var<uniform> time: f32;

@compute @workgroup_size(1) fn wiggle(
    @builtin(global_invocation_id) id: vec3u
) {
    let i = id.x;
    positions[i].x = 5 * sin(origins[i].x/10 - 2*time) + origins[i].x;
}

`