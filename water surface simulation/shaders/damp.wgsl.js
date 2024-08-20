const waterPlaneHeight = 0;
const maxWaveHeight = 0.4;
const terrainPlaneHeight = -0.75;
const maxTerrainHeight = 3; //distance from lowest to highest point

export default /*wgsl*/ `

@group(0) @binding(0) var waveTexture: texture_2d<f32>;
@group(0) @binding(1) var terrainTexture: texture_2d<f32>;
@group(0) @binding(2) var previousTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn updateWave(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let i = id.xy;

    let waveV = textureLoad(waveTexture, i, 0);
    let waterHeight = ${maxWaveHeight} * (waveV.r-waveV.g) + ${waterPlaneHeight};
    let terrainHeight = ${maxTerrainHeight} * (textureLoad(terrainTexture, i, 0).r-0.5) + ${terrainPlaneHeight};
    let oldDampness = textureLoad(previousTexture, i, 0).r;

    if (terrainHeight < waterHeight) { //this bit of the terrain is under the water, and therefore should get damp
        textureStore(outputTexture, i, vec4f( 1 ) );
    }
    else { //not under water, make it dry off a bit
        textureStore(outputTexture, i, vec4f( oldDampness*exp(-0.01)-0.002 ) );
    }
}

`