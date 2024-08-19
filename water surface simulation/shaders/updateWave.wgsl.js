export default /*wgsl*/ `

struct uniforms {
    clickPos: vec2u,
    textureSize: vec2u
}

@group(0) @binding(0) var<uniform> u: uniforms;
@group(0) @binding(1) var outputTexture: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var lastTexture: texture_2d<f32>;
@group(0) @binding(3) var beforeLastTexture: texture_2d<f32>;
@group(0) @binding(4) var obstaclesTexture: texture_2d<f32>;

const c = 5.;
const dt = 0.1;
const dx = 1.;
const dy = 1.;

fn sampleRebound(texture: texture_2d<f32>, pos: vec2i) -> f32 {
    var samplePos = pos;
    let tsI = vec2i(u.textureSize);
    if (pos.x < 0) {samplePos.x = 0;}
    if (pos.x >= i32(tsI.x)) {samplePos.x = tsI.x - 1;}
    if (pos.y < 0) {samplePos.y = 0;}
    if (pos.y >= i32(tsI.y)) {samplePos.y = tsI.y - 1;}

    return textureLoad(texture, samplePos, 0).r;
}

@compute @workgroup_size(1) fn updateWave(
    @builtin(global_invocation_id) id:vec3<u32>
){
    let i = vec2i(id.xy);

    let beforeLastValue = sampleRebound(beforeLastTexture, i);

    let lastValue = sampleRebound(lastTexture, i);
    let lastValueRight = sampleRebound(lastTexture, i + vec2i(1, 0));
    let lastValueLeft = sampleRebound(lastTexture, i + vec2i(-1, 0));
    let lastValueTop = sampleRebound(lastTexture, i + vec2i(0, 1));
    let lastValueBottom = sampleRebound(lastTexture, i + vec2i(0, -1));

    var nextValue = 2*lastValue - beforeLastValue 
    + pow(c*dt/dx, 2)*(lastValueRight - 2*lastValue + lastValueLeft)
    + pow(c*dt/dy, 2)*(lastValueTop - 2*lastValue + lastValueBottom);

    // if the user clicked and this pixel is in a certain radius of the click, add density
    if (u.clickPos.x >= 0 && u.clickPos.x < u.textureSize.x && u.clickPos.y >= 0 && u.clickPos.y < u.textureSize.y){
        if (distance(vec2f(u.clickPos), vec2f(i)) < 4) {nextValue += 0.1;}
    }

    if (textureLoad(obstaclesTexture, i, 0).r == 1.) {
        var obstacleAvg = 0.;

        let rightIsObstacle = sampleRebound(obstaclesTexture, i+vec2i(1, 0));
        let leftIsObstacle = sampleRebound(obstaclesTexture, i+vec2i(-1, 0));
        let topIsObstacle = sampleRebound(obstaclesTexture, i+vec2i(0, 1));
        let bottomIsObstacle = sampleRebound(obstaclesTexture, i+vec2i(0, -1));

        let totalObstacles = rightIsObstacle+leftIsObstacle+topIsObstacle+bottomIsObstacle;

        if (rightIsObstacle == 0.) { obstacleAvg += sampleRebound(lastTexture, i+vec2i(1, 0)); }
        if (leftIsObstacle == 0.) { obstacleAvg += sampleRebound(lastTexture, i+vec2i(-1, 0)); }
        if (topIsObstacle == 0.) { obstacleAvg += sampleRebound(lastTexture, i+vec2i(0, 1)); }
        if (bottomIsObstacle == 0.) { obstacleAvg += sampleRebound(lastTexture, i+vec2i(0, -1)); }

        obstacleAvg /= totalObstacles;

        textureStore(outputTexture, i, vec4f(obstacleAvg));
    }
    else {
        textureStore(outputTexture, i, vec4f(nextValue*0.999));
    }

}

`

//* idea: multiply by something to do with the amount of terrain under the water to weaken waves in shallow parts
// will that make the idea of an obstacle buffer unnecessary? it might just work out