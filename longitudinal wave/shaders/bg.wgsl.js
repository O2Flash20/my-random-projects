export default /*wgsl*/ `

@group(0) @binding(0) var<uniform> time: f32;
@group(0) @binding(1) var drawTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn wiggle(
    @builtin(global_invocation_id) id: vec3u
) {
    let i = id.xy;

    let v = sin(f32(i.x)/10 - 2*time + 2);
    let v2 = 0.5*(0.5*v+1);
    textureStore(
        drawTexture, 
        i, 
        vec4f(v2)
    );
}

`