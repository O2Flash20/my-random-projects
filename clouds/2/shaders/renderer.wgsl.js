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

const numDensitySamples = 50;
const sampleDistanceLimit = 500;
// assuming this pixel is looking at the clouds (a check should be done earlier)
fn getCloudSamplePoints(dir: vec3f, pos: vec3f, cTop: f32, cBottom: f32) -> array<vec3f, numDensitySamples> {
    var output = array<vec3f, numDensitySamples>();
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

        for (var i = 0; i < numDensitySamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numDensitySamples);
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

        for (var i = 0; i < numDensitySamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numDensitySamples);
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

        for (var i = 0; i < numDensitySamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numDensitySamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    return output;
}

const numLightSamples = 6;
fn getSamplePointsCone(coneRadius: f32, coneHeight:f32, origin: vec3f, direction: vec3f) -> array<vec3f, numLightSamples> {
    var output = array<vec3f, numLightSamples>();

    for(var i = 0; i < numLightSamples; i++){
        let iF = f32(i);
        var point = vec3f(
            coneRadius * iF / numLightSamples * sin(500*iF),
            coneRadius * iF / numLightSamples * cos(500*iF),
            coneHeight * (iF*iF)/(numLightSamples*numLightSamples)
        );
        point = rotatePitch(point, -atan2(direction.y, length(direction.xz)));
        point = rotateYaw(point, atan2(direction.x, direction.z));
        output[i] = point + origin;
    }

    return output;
}

fn sampleCloud(samplePoints: array<vec3f, numDensitySamples>, cTop: f32, cBottom: f32, sunDir: vec3f, t: f32) -> vec4f {
    var cloudDensity = 0.;
    var cloudIllumination = 0.;
    for (var i = 0; i < numDensitySamples; i++) {
        cloudDensity += getPointDensity(samplePoints[i], cTop, cBottom, t);

        cloudIllumination += beersPowderLaw(getPointObscurity(samplePoints[i], sunDir, cTop, cBottom, t));
    }
    cloudDensity /= numDensitySamples;
    cloudIllumination /= numDensitySamples;

    cloudIllumination *= 5;

    return vec4f(cloudIllumination, cloudIllumination, cloudIllumination, cloudDensity);
}

fn getPointDensity(pos: vec3f, cTop: f32, cBottom: f32, t:f32) -> f32 {
    let textureSamplePos = pos/vec3f(5000);

    let densityMask = noiseSignal((pos.y-cBottom)/(cTop-cBottom), 0, 1, 0.7) * thresholdSmooth(
        textureSample(fbmwTexture, linearSampler, textureSamplePos + vec3f(t/5, 0, 0)).b/2 +
        textureSample(fbmwTexture, linearSampler, textureSamplePos + vec3f(t*sin(0.2)/5, 0, t*cos(0.2)/5)).a/2,
    1 - u.testVal1, 20);

    let thisCloudDensity = correctFBMWNoiseRange(textureSample(fbmwTexture, linearSampler, 10*textureSamplePos).r) * densityMask;

    const subtractThreshold = 0.5;

    let amountToSubtract = getAmountToSubtract(thisCloudDensity, 0.5);

    return max(thisCloudDensity - amountToSubtract*textureSample(detailTexture, linearSampler, textureSamplePos*50).b, 0);
}

// how much the point is obscured from the light of the sun
fn getPointObscurity(pos: vec3f, sunDir: vec3f, cTop: f32, cBottom: f32, t: f32) -> f32 {
    let samplePoints = getSamplePointsCone(5., 100., pos, sunDir);

    var cloudDensity = 0.;
    for (var i = 0; i < numLightSamples; i++) {
        cloudDensity += getPointDensity(samplePoints[i], cTop, cBottom, t);
    }
    cloudDensity /= numLightSamples;

    return cloudDensity;
}

fn beersPowderLaw(value: f32) -> f32 {
    return 1-exp(-value*2) * exp(-value);
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

fn g1(x: f32, a: f32) -> f32 {
    return exp2(a-1) * pow(x, a);
}
fn thresholdSmooth(value: f32, midPoint: f32, sharpness: f32) -> f32{
    let x = value - midPoint + 0.5;

    if(x <= 0) { return 0; }
    else if (x <= 0.5) { return g1(x, sharpness); }
    else if (x >= 1) { return 1; }
    else { return 1 - g1(1 - x, sharpness); }
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

    let sunDir = normalize(vec3f(cos(u.testVal2*6.28), sin(u.testVal2*6.28), 0));

    // the top and bottom of the cloud volume, this should be changed to realistic values later
    const cTop = 757.;
    const cBottom = 330.;

    // get the points to sample the cloud volume
    var isLookingAtClouds = true;
    var samplePoints = array<vec3f, numDensitySamples>();
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

    let cloudInfo = sampleCloud(samplePoints, cTop, cBottom, sunDir, u.time/100);

    let cloudAlpha = cloudInfo.a; //? do something to it
    let cloudAlphaClamped = clamp(cloudAlpha, 0, 1);

    // the color of the environment around the clouds
    var envCol = vec3f(16, 102, 8)/255;
    if (acos(dot(worldDir, sunDir)) < 0.02) { //should be .0087 to get the sun as it is irl
        envCol = vec3f(1.);
    }
    else if (worldDir.y > 0) {
        envCol = vec3f(53, 84, 115)/255;
    }

    // the color of the clouds
    let cloudCol = cloudInfo.rgb;

    let compositeCol = cloudAlphaClamped*cloudCol + (1. - cloudAlphaClamped)*envCol;

    return vec4f(compositeCol, 1.);
}

`

// it would be really cool to simulate the curvature of the earth (by having the sample rays curve?)