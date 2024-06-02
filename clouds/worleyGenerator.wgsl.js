export default /*wgsl*/ `

const wSideL = 200; //the workgroups have ids in 3d, the sides of that cube are defined here

@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(1) fn generateWorleyNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let oneDIndex = id.x*wSideL*wSideL + id.y*wSideL+id.z;
    data[oneDIndex] = sin(f32(id.x));
};

`