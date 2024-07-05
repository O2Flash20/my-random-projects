export default /*wgsl*/ `

@group(0) @binding(0) var fbmTexture: texture_storage_3d<rgba8unorm, write>;

// thanks chatgpt buddy 🙂
fn hash3(v: vec3<u32>) -> u32 {
    var h: u32 = v.x * 374761393u + v.y * 668265263u + v.z * 68486371u;
    h = (h ^ (h >> 13u)) * 1274126177u;
    h = (h ^ (h >> 16u)) * 198491317u;
    return h;
}

fn random(vec: vec3<u32>) -> f32 {
    let hashValue: u32 = hash3(vec);
    // Convert to float and normalize to [0, 1]
    return f32(hashValue) / 4294967295.0;
}



@compute @workgroup_size(1) fn generateFBMNoise(
    @builtin(global_invocation_id) id:vec3<u32>
){
    textureStore(
        fbmTexture,
        id,
        vec4f(
            random(id),
            random(id+vec3u(128)),
            random(id+vec3u(256)),
            random(id+vec3u(384)),
        )
    );
}

`