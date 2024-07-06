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
    projDist: f32
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

const numCloudSamples = 10;
const sampleDistanceLimit = 10000;
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

@fragment fn render(i: vertexShaderOutput) -> @location(0) vec4f {
    let fbmwValue = textureSample(fbmwTexture, linearSampler, vec3f(i.uv, u.time/10));
    let detailValue = textureSample(detailTexture, linearSampler, vec3f(i.uv, u.time/10));

    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.dir.y), -u.dir.x);

    // the top and bottom of the cloud volume, this should be changed to realistic values later
    const cTop = 150.;
    const cBottom = 50.;

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

    // return vec4f(worldDir, 0.);
    return vec4f(samplePoints[0].y/200., samplePoints[5].y/200., samplePoints[9].y/200., 0.);
}

`