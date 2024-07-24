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
    camPos: vec3f,
    camDir: vec2f,
    projDist: f32,
    sunDir: vec2f,
    screenSize: vec2u
}

@group(0) @binding(0) var<uniform> u: uniforms;
@group(0) @binding(1) var waveTexture: texture_2d<f32>;
@group(0) @binding(2) var gradientTexture: texture_2d<f32>;
@group(0) @binding(3) var obstaclesTexture: texture_2d<f32>;
@group(0) @binding(4) var linearSampler: sampler;

fn rotateYaw(position: vec3f, yaw:f32) -> vec3f {
    return vec3f( position.z * sin(yaw) + position.x * cos(yaw), position.y, position.z * cos(yaw) - position.x * sin(yaw) );
}

fn rotatePitch(position: vec3f, pitch:f32) -> vec3f {
    return vec3f( position.x, position.y * cos(pitch) - position.z * sin(pitch), position.y * sin(pitch) + position.z * cos(pitch) );
}

//* aspect ratio is height/width of the canvas being drawn to
fn uvToScreenDir(uv: vec2f, projectionDist: f32, aspectRatio: f32) -> vec3f {
    let z = projectionDist;
    let x = uv.x * -2.0 + 1.0;
    let y = uv.y * 2.0 * aspectRatio - aspectRatio;
    return normalize(vec3f(x, y, z));
}

fn getWaterHeight(pos: vec3f) -> f32 {
    let uv = pos.xz/waterPlaneSize + vec2f(0.5);
    let textureValue = maxWaveHeight*textureSample(waveTexture, linearSampler, uv);
    return textureValue.r - textureValue.g;
}

fn getWaterGradient(pos:vec3f) -> vec3f {
    let uv = pos.xz/waterPlaneSize + vec2f(0.5);
    let textureValue = textureSample(gradientTexture, linearSampler, uv);
    return textureValue.rgb;
}

const sunDir = normalize(vec3f(1, 1, 0));

const waterPlaneHeight = 0;
const waterPlaneSize = vec2f(20);
const maxWaveHeight = 0.5;
@fragment fn render(i: vertexShaderOutput) -> @location(0) vec4f {
    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.camDir.y), -u.camDir.x);

    var lookingAtWaterPlane = (worldDir.y < 0 && u.camPos.y > waterPlaneHeight) || (worldDir.y >= 0 && u.camPos.y <= waterPlaneHeight);

    // let planeProjPos = vec2f(
    //     (u.camPos.y-waterPlaneHeight)/worldDir.y * worldDir.x - u.camPos.x,
    //     (u.camPos.y-waterPlaneHeight)/worldDir.y * worldDir.z - u.camPos.z
    // );
    let planeProjPos = vec3f(
        (u.camPos.y-(waterPlaneHeight+maxWaveHeight/2)) / worldDir.y * worldDir.x - u.camPos.x,
        waterPlaneHeight + maxWaveHeight/2,
        (u.camPos.y-(waterPlaneHeight+maxWaveHeight/2)) / worldDir.y * worldDir.z - u.camPos.z
    );

    var samplePos = planeProjPos;
    var stepSize = 0.05;
    for (var i = 0; i < 100; i++){ //!something about this doesnt work from under
        let waterHeight = getWaterHeight(samplePos) + waterPlaneHeight;
        if (waterHeight < samplePos.y) {
            // hasn't hit water, keep moving forward
            samplePos += stepSize * worldDir;
        }
        else {
            // sample pos is under the water, step back to find the boundary of air to water
            stepSize *= 0.5;
            samplePos -= stepSize * worldDir;
        }
    }

    let gradient = getWaterGradient(samplePos);
    let dotToSun = pow(dot(gradient, sunDir), 5.);

    lookingAtWaterPlane = lookingAtWaterPlane && samplePos.x < waterPlaneSize.x/2 && samplePos.x > -waterPlaneSize.x/2 && samplePos.z < waterPlaneSize.y/2 && samplePos.z > -waterPlaneSize.y/2;

    let obstacles = textureSample(obstaclesTexture, linearSampler, samplePos.xz/waterPlaneSize + vec2f(0.5)).r;

    if (lookingAtWaterPlane) {
        return vec4f(
            vec3f(0, 179, 255)/255. + vec3f(dotToSun + obstacles),
            1.
        );
    }
    else {
        return vec4f(0);
    }
}

`