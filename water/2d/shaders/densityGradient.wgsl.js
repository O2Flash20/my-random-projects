export default /*wgsl*/ `

@group(0) @binding(0) var densityTexture: texture_2d<f32>;
@group(0) @binding(1) var gradientTexture: texture_storage_2d<rg32float, write>;

@compute @workgroup_size(1) fn generateGradient(
    @builtin(global_invocation_id) id: vec3<u32>
){
    textureStore(
        gradientTexture,
        id.xy,
        vec4f(
            (textureLoad(densityTexture, vec2u(id.x-1, id.y), 0).r - textureLoad(densityTexture, vec2u(id.x+1, id.y), 0).r) / 2.,
            (textureLoad(densityTexture, vec2u(id.x, id.y-1), 0).r - textureLoad(densityTexture, vec2u(id.x, id.y+1), 0).r) / 2.,
            0.,
            1.
        )
    );
}

`