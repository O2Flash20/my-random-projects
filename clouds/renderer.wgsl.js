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

//----------------------------------------

const pi = 3.1415926535;

struct cameraInfo {
    position:vec3f,
    direction:vec2f,
    projectionDist: f32
};

@group(0) @binding(0) var<uniform> time: u32;
@group(0) @binding(1) var<uniform> camera: cameraInfo;
@group(0) @binding(2) var worleyNoise: texture_3d<f32>;
@group(0) @binding(3) var texSampler: sampler;

fn rotate3d(inputVec:vec3f, yaw:f32, pitch:f32) -> vec3f{
    let angleZtoY = atan(inputVec.y/inputVec.z);
    let magZY = length(inputVec.zy);
    let newAngleZtoY = angleZtoY + pitch;
    let newY = magZY * sin(newAngleZtoY);
    let zIntermediate = magZY * cos(newAngleZtoY);

    let angleXtoZ = atan(zIntermediate / inputVec.x);
    let newAngleXtoZ = angleXtoZ + yaw;
    let magXZ = length(vec2f(zIntermediate, inputVec.x));
    var newX = magXZ*cos(newAngleXtoZ);
    var newZ = magXZ*sin(newAngleXtoZ);

    if (inputVec.x<0.) {
        newX = -newX;
        newZ = -newZ;
    }

    return vec3f(newX, newY, newZ);
}

fn uvToScreenDir(uv:vec2f, projectionDistance:f32)->vec3f{
    let z = projectionDistance;
    let x = uv.x * -2.0 + 1.0;
    let y = uv.y * 2.0 * 0.75 - 0.75; //0.75 is height/width ratio
    return normalize(vec3f(x, y, z));
}

// * 4 moving textures is probably excessive and very costly, another shader should put 3 together and then have only the last one that moves independently
fn getCloudDensity(worleyTexture: texture_3d<f32>, samplePoint: vec3f, scaler:vec3f, offsets: array<vec3f, 4>) -> f32 {
    let level1 = 1. - textureSample(worleyTexture, texSampler, samplePoint/scaler + offsets[0]).r;
    let level2 = 1. - textureSample(worleyTexture, texSampler, samplePoint/scaler + offsets[1]).g;
    let level3 = 1. - textureSample(worleyTexture, texSampler, samplePoint/scaler + offsets[2]).b;
    let level4 = 1. - textureSample(worleyTexture, texSampler, samplePoint/scaler + offsets[3]).a;

    return 0.0625 * level1 + 0.125 * level2 + 0.25 * level3 + 0.5 * level4;
}

const numCloudSamples = 9;
const sampleDistanceLimit = 2000.;
// assuming this pixel is looking at the clouds (a check should be done earlier)
fn getCloudSamplePoints(dir: vec3f, pos:vec3f, cloudBottom:f32, cloudTop:f32) -> array<vec3f, numCloudSamples> {
    var output = array<vec3f, numCloudSamples>();

    var startPos = vec3f(0.);
    var endPos = vec3f(0.);
    if (pos.y >= cloudBottom && pos.y <= cloudTop){
        startPos = pos; //in the clouds, so the sampling line starts at the current position

        if (dir.y < 0){
            endPos = vec3f(
                dir.x/dir.y * (cloudBottom-pos.y) + pos.x,
                cloudBottom,
                dir.z/dir.y * (cloudBottom-pos.y) + pos.z
            );
        }else{
            endPos = vec3f(
                dir.x/dir.y * (cloudTop-pos.y) + pos.x,
                cloudTop,
                dir.z/dir.y * (cloudTop-pos.y) + pos.z
            );
        }

        if (length(endPos-pos) > sampleDistanceLimit) {endPos = sampleDistanceLimit*normalize(endPos-pos)+pos;}

        for (var i = 0; i < numCloudSamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    else if (pos.y < cloudBottom){ //below the clouds
        startPos = vec3f(
            dir.x/dir.y * (cloudBottom-pos.y) + pos.x,
            cloudBottom,
            dir.z/dir.y * (cloudBottom-pos.y) + pos.z
        );

        endPos = vec3f(
            dir.x/dir.y * (cloudTop-pos.y) + pos.x,
            cloudTop,
            dir.z/dir.y * (cloudTop-pos.y) + pos.z
        );
        if (length(endPos-pos) > sampleDistanceLimit) {endPos = sampleDistanceLimit*normalize(endPos-pos)+pos;}

        for (var i = 0; i < numCloudSamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    else if (pos.y > cloudTop){ //above the clouds
        startPos = vec3f(
            dir.x/dir.y * (cloudTop-pos.y) + pos.x,
            cloudTop,
            dir.z/dir.y * (cloudTop-pos.y) + pos.z
        );

        endPos = vec3f(
            dir.x/dir.y * (cloudBottom-pos.y) + pos.x,
            cloudBottom,
            dir.z/dir.y * (cloudBottom-pos.y) + pos.z
        );
        if (length(endPos-pos) > sampleDistanceLimit) {endPos = sampleDistanceLimit*normalize(endPos-pos)+pos;}

        for (var i = 0; i < numCloudSamples; i++){
            let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
            output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
        }
    }

    return output;
}

fn getCloudSamplePoints2(dir: vec3f, pos:vec3f, cloudBottom:f32, cloudTop:f32) -> array<vec3f, numCloudSamples> {
    var output = array<vec3f, numCloudSamples>();
    let startPos = pos;
    let endPos = pos + dir*sampleDistanceLimit;
    for (var i = 0; i < numCloudSamples; i++){
        let mixAmount = (2.*f32(i) + 1.) / (2.*numCloudSamples);
        output[i] = linearInterpolateVec3(mixAmount, startPos, endPos);
    }

    return output;
}

fn linearInterpolateVec3(mix:f32, start:vec3f, end:vec3f) -> vec3f {
    return (1-mix)*start + mix*end;
}

// should be changed for something more customizable later
fn contrast(value:f32, iterations: i32) -> f32 {
    var v = value;
    for(var i=0;i<iterations;i++){
        v = 0.5 * sin(pi*(v-0.5)) + 0.5;
    }
    return v;
}

const numIlluminationSamples = 4;
fn getCloudIllumination(pos: vec3f, scaler: vec3f, cloudOffsets: array<vec3f, 4>, sunDir:vec3f, cloudTop:f32) -> f32 {
    let endPos = vec3f(
        sunDir.x/sunDir.y * (cloudTop-pos.y) + pos.x,
        cloudTop,
        sunDir.z/sunDir.y * (cloudTop-pos.y) + pos.z
    );

    var totalDensity = 0.;
    for (var i = 0; i < numIlluminationSamples; i++){
        let mixAmount = (2.*f32(i) + 1.) / (2.*numIlluminationSamples);
        let samplePosition = linearInterpolateVec3(mixAmount, pos, endPos);
        totalDensity += contrast(getCloudDensity(worleyNoise, samplePosition, scaler, cloudOffsets), 10); //*i need to rethink where i have my contrasts
    }
    totalDensity /= f32(numIlluminationSamples);

    return exp(-totalDensity);
}

@fragment fn fs(fsi:vertexShaderOutput)->@location(0)vec4f{
    let timeSec = f32(time)/1000.;
    let p = camera.position;
    let d = camera.direction;

    /* todo: cast multiple rays for anti-aliasing
        could be done with making this a 3d texture and having each ray its own depth?
        also at that point do depth of field
    */

    const sunDir = normalize(vec3f(0., -1., -3.));

    let screenDir = uvToScreenDir(fsi.uv, camera.projectionDist);
    let worldDir = rotate3d(screenDir, d.x, d.y);

    var col = vec3f(0., 0., 0.);

    const cloudHeightBottom = 50.;
    const cloudHeightTop = 350.;

    // offsets to move the clouds with time
    let cloudOffsets = array<vec3f, 4>(
        vec3f(timeSec/40., 0, 0),
        vec3f(timeSec/80., 0, 0),
        vec3f(timeSec/160., 0, 0),
        vec3f(timeSec/320., 0, 0)
    );
    // let cloudOffsets = array<vec3f, 4>(
    //     vec3f(0, 0, 0),
    //     vec3f(0, 0, 0),
    //     vec3f(0, 0, 0),
    //     vec3f(0, 0, 0)
    // );

    var isLookingAtClouds = true;
    var cloudSamplePoints = array<vec3f, numCloudSamples>();
    if (
        (p.y < cloudHeightBottom && worldDir.y < 0)
        ||
        (p.y > cloudHeightTop && worldDir.y > 0)
    ){ //this pixel isnt looking at clouds
        isLookingAtClouds = false;
        cloudSamplePoints = array<vec3f, numCloudSamples>();
    }
    else{ //this pixel is looking at clouds
        cloudSamplePoints = getCloudSamplePoints(worldDir, p, cloudHeightBottom, cloudHeightTop);
    }

    // even pixels that aren't looking at clouds have to do all this sadly
    var avgDensity = 0.;
    var avgBrightness = 0.;
    let cloudSampleScaler = vec3f(1000.);
    for (var i = 0; i < numCloudSamples; i++){
        avgDensity += getCloudDensity(worleyNoise, cloudSamplePoints[i], cloudSampleScaler, cloudOffsets);
        avgBrightness += getCloudIllumination(cloudSamplePoints[i], cloudSampleScaler, cloudOffsets, sunDir, cloudHeightTop);
    }
    avgDensity /= f32(numCloudSamples);
    avgBrightness /= f32(numCloudSamples);
    if(!isLookingAtClouds){avgDensity = 0.;} //get rid of all that work if it's not looking at a cloud
    let cloudDensity = vec3f(contrast(avgDensity, 10));

    var environmentCol = vec3f(0.);

    if (worldDir.y > 0) {
        environmentCol = vec3f(0.1, 0.2, 0.5);
    }
    else{
        environmentCol = vec3f(0., 0.2, 0.);
    }

    col = cloudDensity*vec3f(avgBrightness) + (1-cloudDensity)*environmentCol;
    return vec4f(col, 1.);

    // return textureSample(worleyNoise, texSampler, vec3f(fsi.uv, timeSec/10 % 1.)*vec3f(3., 3., 1.));
}

// would be nice to add a fog for outside the sample limit
// when you're say, in the clouds but really close to the top, all the sample points will be around the same place so whatever's there gets a lot of weight to it. idk how that can be fixed. multiplying the density by the distance from the start to the end of the sampling?
`