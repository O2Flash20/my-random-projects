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
const maxFogDistance = 2000; //the distance at which the fog is fully opaque
// assuming this pixel is looking at the clouds (a check should be done earlier)
fn getSamplingEndPoints(pos: vec3f, dir: vec3f, cTop: f32, cBottom: f32) -> array<vec3f, 2> { // returns the start and end of the line that this pixel should sample along
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
        if (distance(endPos, pos) > maxFogDistance) { endPos = maxFogDistance*normalize(endPos-pos)+pos; }
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
        if (distance(pos, startPos) > maxFogDistance) { return array<vec3f, 2>(vec3f(0), vec3f(0)); }
        if (distance(pos, endPos) > maxFogDistance) { endPos = maxFogDistance * normalize(endPos-pos) + pos; }
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

        if (distance(pos, startPos) > maxFogDistance) { return array<vec3f, 2>(vec3f(0), vec3f(0)); }
        if (distance(pos, endPos) > maxFogDistance) { endPos = maxFogDistance * normalize(endPos-pos) + pos; }
    }

    return array<vec3f, 2>(startPos, endPos);
}

const numLightSamples = 6;
fn getSamplePointsCone(coneRadius: f32, coneHeight:f32, origin: vec3f, direction: vec3f) -> array<vec3f, numLightSamples> {
    var output = array<vec3f, numLightSamples>();

    for(var i = 0; i < numLightSamples; i++){
        let iF = f32(i);
        var point = vec3f(
            coneRadius * iF / numLightSamples * sin(500*iF),
            coneRadius * iF / numLightSamples * cos(500*iF),
            coneHeight * (iF*iF*iF)/(numLightSamples*numLightSamples*numLightSamples)
        );
        point = rotatePitch(point, -atan2(direction.y, length(direction.xz)));
        point = rotateYaw(point, atan2(direction.x, direction.z));
        output[i] = point + origin;
    }

    return output;
}

fn sampleCloud(camPos: vec3f, camDir: vec3f, sampleStart: vec3f, sampleEnd: vec3f, cTop: f32, cBottom: f32, sunDir: vec3f, t: f32) -> vec4f {
    let totalSampleDistance = distance(sampleStart, sampleEnd); // the total distance that might need to be covered by samples
    let WideSampleSpacing = 2 * totalSampleDistance / f32(numDensitySamples);
    let NarrowSampleSpacing = WideSampleSpacing / 5;

    var cloudDensity = 0.;
    var sunIllumination = 0.;
    var transmittance = 1.;

    var usingNarrowSpacing = false;
    var samplingPos = sampleStart;
    var numSamplesWithoutDensity = 0;

    for (var i = 0; i < numDensitySamples; i++) {
        let thisDensity = getPointDensity(camPos, samplingPos, cTop, cBottom, t);
        let thisObscurity = getPointObscurity(camPos, samplingPos, sunDir, cTop, cBottom, t); //it's a shame that this has to be done even when it's not needed but wgsl wants texture sampling to be done only in uniform control flow

        if (thisDensity != 0) { //there's density here
            if (usingNarrowSpacing) { //we're using narrow sampling in an area with density, so process this data and keep going

                cloudDensity += thisDensity * NarrowSampleSpacing;
                let phase = twoLobeHG(camDir, sunDir, 0.8, -0.5, 0.5);
                transmittance *= beersLaw(thisDensity * NarrowSampleSpacing);

                let incomingLight = beersLaw(15*thisObscurity);

                sunIllumination += incomingLight * phase * transmittance * thisDensity * NarrowSampleSpacing;

                samplingPos += NarrowSampleSpacing * camDir;

            }
            else { //we have just entered an area with density and should switch to narrow sampling
                samplingPos -= WideSampleSpacing * camDir; //go back a bit so that stuff doesn't get missed
                usingNarrowSpacing = true; //switch to narrow sampling to get details
                numSamplesWithoutDensity = 0;
            }
        }
        else { //there's no density here
            if (usingNarrowSpacing) { //we just exited an area with density while doing narrow sample spacing
                numSamplesWithoutDensity++;
                if (numSamplesWithoutDensity >= 3) { //it's been a while without density, switch back to wide sample spacing
                    usingNarrowSpacing = false;
                    samplingPos += WideSampleSpacing * camDir;
                }
                else { //keep going with narrow spacing a bit
                    samplingPos += NarrowSampleSpacing * camDir;
                }
            }
            else { //we're still in an area with no density, keep moving ahead
                samplingPos += WideSampleSpacing * camDir;
            }
        }
    }

    // tonemapping
    sunIllumination = ACES(sunIllumination);

    let sunCol = vec3f(250, 255, 186)/255;
    let skyCol = vec3f(173, 205, 255)/255;

    let cloudCol = sunCol*sunIllumination + skyCol*0.7;

    return vec4f(cloudCol, cloudDensity);
}

fn getPointDensity(camPos: vec3f, pos: vec3f, cTop: f32, cBottom: f32, t:f32) -> f32 {
    let textureSamplePos = pos/vec3f(5000);

    let densityMask = noiseSignal((pos.y-cBottom)/(cTop-cBottom), 0, 1, 0.7) * (
        textureSample(fbmwTexture, linearSampler, textureSamplePos + vec3f(t/5, 0, 0)).b/2 +
        textureSample(fbmwTexture, linearSampler, textureSamplePos + vec3f(t*sin(0.2)/5, 0, t*cos(0.2)/5)).a/2
    ) - u.testVal1;

    var thisCloudDensity = max(densityMask*3, 0);
    thisCloudDensity *= correctFBMWNoiseRange(textureSample(fbmwTexture, linearSampler, 10*textureSamplePos).r);

    let detailTextureValue = textureSample(detailTexture, linearSampler, textureSamplePos*60);
    let amountToSubtract = getAmountToSubtract(thisCloudDensity, 0.2);
    thisCloudDensity -= amountToSubtract * (detailTextureValue.a+detailTextureValue.b)/2;

    return max(thisCloudDensity, 0); //making sure density isnt negative
}

// how much the point is obscured from the light of the sun
fn getPointObscurity(camPos:vec3f, pos: vec3f, sunDir: vec3f, cTop: f32, cBottom: f32, t: f32) -> f32 {
    let samplePoints = getSamplePointsCone(1., 50., pos, sunDir);

    var cloudDensity = 0.;
    for (var i = 0; i < numLightSamples; i++) {
        cloudDensity += getPointDensity(camPos, samplePoints[i], cTop, cBottom, t);
    }
    cloudDensity /= numLightSamples;

    return cloudDensity;
}

// !not used YET
fn fogOpacity(distanceInFog: f32, maxFogDistance: f32) -> f32 {
    return min(1.01 - exp(-4.6*distanceInFog/maxFogDistance), 1.);
}

// not used
fn beersPowderLaw(value: f32) -> f32 {
    return 1-exp(-value*2) * exp(-value);
}
fn beersLaw(value: f32) -> f32 {
    return exp(-value);
}

// for water, g should be around 0.85-0.95
fn henyeyGreenstein(dir: vec3f, sunDir: vec3f, g: f32) -> f32 {
    let cosTheta = dot(dir, sunDir);

    return 0.79577474*(1-g*g)/pow(1+g*g-2*g*cosTheta, 1.5);
    // that first constant is 1/4π
}
fn twoLobeHG(dir: vec3f, sunDir: vec3f, g1: f32, g2: f32, lerp: f32) -> f32 {
    let a1 = henyeyGreenstein(dir, sunDir, g1);
    let a2 = henyeyGreenstein(dir, sunDir, g2);
    return lerp*a1 + (1-lerp)*a2;
}

// not used
fn reinhard(lum: f32) -> f32 {
    return lum/(lum+1);
}
fn ACES(x: f32) -> f32 {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
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

    // // get the points to sample the cloud volume
    // var isLookingAtClouds = true;
    // var samplePoints = array<vec3f, numDensitySamples>();
    // if (
    //     (u.pos.y < cBottom && worldDir.y < 0)
    //     ||
    //     (u.pos.y > cTop && worldDir.y > 0)
    // ){ //this pixel isnt looking at clouds, keeps the sample points at a useless (0, 0, 0)
    //     isLookingAtClouds = false;
    // }
    // else{ //this pixel is looking at clouds, so get the sample points
    //     samplePoints = getCloudSamplePoints(worldDir, u.pos, cTop, cBottom);
    // }

    // let cloudInfo = sampleCloud(u.pos, samplePoints, cTop, cBottom, worldDir, sunDir, u.time/100);

    var isLookingAtClouds = true;
    var sampleStart = vec3f(0); var sampleEnd = vec3f(0);
    if ( !(
            (u.pos.y < cBottom && worldDir.y < 0)
            ||
            (u.pos.y > cTop && worldDir.y > 0)
        )
    ) { //this pixel is looking at clouds, so get the sample end points
        let sampleEndPoints = getSamplingEndPoints(u.pos, worldDir, cTop, cBottom);
        sampleStart = sampleEndPoints[0]; sampleEnd = sampleEndPoints[1];
    }

    let cloudInfo = sampleCloud(u.pos, worldDir, sampleStart, sampleEnd, cTop, cBottom, sunDir, u.time/100); //should be /1000

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