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
    screenSize: vec2u,
    time: f32,
    pos: vec3f,
    dir: vec2f,
    projDist: f32,
    testVal1: f32,
    testVal2: f32,
    testVal3: f32
}

@group(0) @binding(0) var<uniform> u: uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var fbmwTexture: texture_3d<f32>;
@group(0) @binding(3) var detailTexture: texture_3d<f32>;

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

fn linearInterpolateVec3(mix:f32, start:vec3f, end:vec3f) -> vec3f {
    return (1. - mix) * start + mix * end;
}

const numCloudSamples = 50;
const sampleDistanceLimit = 500;
// assuming this pixel is looking at the clouds (a check should be done earlier)
fn getCloudSamplePoints(dir: vec3f, pos: vec3f, cTop: f32, cBottom: f32) -> array<vec3f, numCloudSamples> {
    var output = array<vec3f, numCloudSamples>();
    var startPos = vec3f(0.);
    var endPos = vec3f(0.);

    if (pos.y >= cBottom && pos.y <= cTop){
        startPos = pos; //in the clouds, so the sampling line starts at the current position

        if (dir.y < 0){
            endPos = vec3f(
                dir.x/dir.y * (cBottom-pos.y) + pos.x,
                cBottom,
                dir.z/dir.y * (cBottom-pos.y) + pos.z
            );
        }else{
            endPos = vec3f(
                dir.x/dir.y * (cTop-pos.y) + pos.x,
                cTop,
                dir.z/dir.y * (cTop-pos.y) + pos.z
            );
        }
        if (length(endPos-startPos) > sampleDistanceLimit) {endPos = sampleDistanceLimit*normalize(endPos-startPos)+startPos;}

        for (var i = 0; i < numCloudSamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    else if (pos.y < cBottom){ //below the clouds
        startPos = vec3f(
            dir.x/dir.y * (cBottom-pos.y) + pos.x,
            cBottom,
            dir.z/dir.y * (cBottom-pos.y) + pos.z
        );

        endPos = vec3f(
            dir.x/dir.y * (cTop-pos.y) + pos.x,
            cTop,
            dir.z/dir.y * (cTop-pos.y) + pos.z
        );
        if (length(endPos-startPos) > sampleDistanceLimit) {endPos = sampleDistanceLimit*normalize(endPos-startPos)+startPos;}

        for (var i = 0; i < numCloudSamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    else if (pos.y > cTop){ //above the clouds
        startPos = vec3f(
            dir.x/dir.y * (cTop-pos.y) + pos.x,
            cTop,
            dir.z/dir.y * (cTop-pos.y) + pos.z
        );

        endPos = vec3f(
            dir.x/dir.y * (cBottom-pos.y) + pos.x,
            cBottom,
            dir.z/dir.y * (cBottom-pos.y) + pos.z
        );
        if (length(endPos-startPos) > sampleDistanceLimit) {endPos = sampleDistanceLimit*normalize(endPos-startPos)+startPos;}

        for (var i = 0; i < numCloudSamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    return output;
}

// blackLevel and value are numbers 0->1, under that blackLevel, returns 0. above, value is remapped
// !not great, i think because the noise practically isnt in the 0->1 range, a contrast function might be better, or one that preserves the area of the function
fn thresholdBlack(value: f32, blackLevel: f32) -> f32 {
    if (value <= blackLevel) { return 0.; }
    else { return (value-1.) * (1./(1-blackLevel)) + 1.; }
}

@fragment fn render(i: vertexShaderOutput) -> @location(0) vec4f {
    let fbmwValue = textureSample(fbmwTexture, linearSampler, vec3f(i.uv, u.time/10));
    let detailValue = textureSample(detailTexture, linearSampler, vec3f(i.uv, u.time/10));

    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.dir.y), -u.dir.x);

    // the top and bottom of the cloud volume, this should be changed to realistic values later
    const cTop = 250.;
    const cBottom = 150.;

    // get the points to sample the cloud volume
    var isLookingAtClouds = true;
    var samplePoints = array<vec3f, numCloudSamples>();
    if (
        (u.pos.y < cBottom && worldDir.y < 0)
        ||
        (u.pos.y > cTop && worldDir.y > 0)
    ){ //this pixel isnt looking at clouds, keeps the sample points at a useless (0, 0, 0)
        isLookingAtClouds = false;
    }
    else{ //this pixel is looking at clouds, so get the sample points
        samplePoints = getCloudSamplePoints(worldDir, u.pos, cTop, cBottom);
    }

    var cloudDensity = 0.;
    for (var i = 0; i < numCloudSamples; i++) {
        cloudDensity += thresholdBlack(
            textureSample(fbmwTexture, linearSampler, samplePoints[i]/vec3f(u.testVal2*2000)).r,
            u.testVal1
        );
    }
    cloudDensity /= numCloudSamples;
    let cloudDensityClamped = clamp(cloudDensity, 0., 1.);

    // the color of the environment around the clouds
    var envCol = vec3f(16, 102, 8)/255;
    if (worldDir.y > 0) {
        envCol = vec3f(176, 231, 255)/255;
    }

    // the color of the clouds
    let cloudCol = vec3f(1.);

    let compositeCol = cloudDensityClamped*cloudCol + (1. - cloudDensityClamped)*envCol;

    // return vec4f(worldDir, 0.);
    // return vec4f(samplePoints[0].y/200., samplePoints[5].y/200., samplePoints[9].y/200., 0.);
    // return vec4f(compositeCol, 1.);

    return vec4f(vec3f(cloudDensity), 1.);
}

`