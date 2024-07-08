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

const numCloudSamples = 100;
const sampleDistanceLimit = 2000;
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

// all values are in the [0, 1] range
fn f1(x: f32) -> f32 {
    return -(cos(3.14159265*x) - 1.) / 2.;
}
fn f2(x: f32, k: f32) -> f32 {
    if (0 <= x && x < k) {return f1(x/k);}
    if (k <= x && x <= 1. - k) {return 1;}
    if (1. - k < x && x <= 1) {return f1(-(x-1.)/k);}
    return 0;
}
fn noiseSignal(sampleHeight: f32, startHeight: f32, endHeight: f32, sustainLength: f32) -> f32 {
    let k = (1. - sustainLength)/2.;
    if (sampleHeight <= startHeight || sampleHeight >= endHeight) {return 0.;}
    else {return f2((sampleHeight-startHeight)/(endHeight-startHeight), k);}
}

// the fbmw noise isnt exactly [0, 1], so this makes it closer to that
fn correctFBMWNoiseRange(noiseValue: f32) -> f32 {
    return 2*noiseValue - 0.5;
}

// blackLevel and value are numbers 0->1, under that blackLevel, returns 0. above, value is remapped
fn thresholdBlack(value: f32, blackLevel: f32) -> f32 {
    if (value <= blackLevel) { return 0.; }
    else { return (value-1.) * (1./(1-blackLevel)) + 1.; }
}

fn contrast(value: f32, amount: f32) -> f32 {
    let v = clamp(value, 0, 1);
    if (v <= 0.5) {return pow(2., amount-1.)*pow(v, amount);}
    else {return 1 - pow(2., amount-1.)*pow(1-v, amount);}
}

fn getAmountToSubtract(value: f32, threshold: f32) -> f32{
    if (value > threshold) {return 0;}
    else { return clamp(1. - 1/threshold * value, 0., 1.); }
}

@fragment fn render(i: vertexShaderOutput) -> @location(0) vec4f {
    let fbmwValue = textureSample(fbmwTexture, linearSampler, vec3f(i.uv, u.time/10));
    let detailValue = textureSample(detailTexture, linearSampler, vec3f(i.uv, u.time/10));

    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.dir.y), -u.dir.x);

    // the top and bottom of the cloud volume, this should be changed to realistic values later
    const cTop = 550.;
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
        let textureSamplePos = samplePoints[i]/vec3f(5000);
        let fbmwTextureValue = correctFBMWNoiseRange(textureSample(fbmwTexture, linearSampler, 10*textureSamplePos).r);

        // ! this should have some threshold control
        let densityMask = noiseSignal((samplePoints[i].y-cBottom)/(cTop-cBottom), 0, 1, 0.7) * contrast(
            textureSample(fbmwTexture, linearSampler, textureSamplePos + vec3f(u.testVal1/5, 0, 0)).b/2 +
            textureSample(fbmwTexture, linearSampler, textureSamplePos + vec3f(u.testVal1*sin(0.2)/5, 0, u.testVal1*cos(0.2)/5)).a/2,
            20
        );

        let thisCloudDensity = fbmwTextureValue * densityMask;

        const subtractThreshold = 0.5;

        let amountToSubtract = getAmountToSubtract(thisCloudDensity, u.testVal2);

        cloudDensity += max(thisCloudDensity - amountToSubtract*textureSample(detailTexture, linearSampler, textureSamplePos*50).b, 0);
    }
    cloudDensity /= numCloudSamples;

    var cloudDensityClamped = clamp(cloudDensity, 0., 1.);
    cloudDensityClamped = u.testVal3 * 15 * (1. - exp(-cloudDensityClamped));

    // the color of the environment around the clouds
    var envCol = vec3f(16, 102, 8)/255;
    if (worldDir.y > 0) {
        envCol = vec3f(53, 84, 115)/255;
    }

    // the color of the clouds
    let cloudCol = vec3f(1.);

    let compositeCol = cloudDensityClamped*cloudCol + (1. - cloudDensityClamped)*envCol;

    return vec4f(compositeCol, 1.);
}

`

// it would be really cool to simulate the curvature of the earth (by having the sample rays curve?)