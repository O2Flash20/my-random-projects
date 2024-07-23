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

struct objectInfo {
    dist: f32,
    col: vec3f
}

fn objUnion(obj1: objectInfo, obj2: objectInfo) -> objectInfo {
    if (obj1.dist <= obj2.dist) { return obj1; }
    else { return obj2; }
}

fn sdfGround(p: vec3f, height: f32, color: vec3f) -> objectInfo {
    var output: objectInfo;
    output.dist = p.y-height;
    output.col = color;
    return output;
}

fn sdfSphere(p: vec3f, center: vec3f, radius: f32, color: vec3f) -> objectInfo {
    var output: objectInfo;
    output.dist = distance(p, center) - radius;
    output.col = color;
    return output;
}

fn sdfBox(p: vec3f, center: vec3f, size: vec3f, color: vec3f) -> objectInfo {
    var output: objectInfo;
    let s = p - center;
    let q = abs(s) - size;

    output.dist = length(max(q, vec3f(0))) + min(max(s.x, max(q.y, q.z)), 0);
    output.col = color;

    return output;
}

fn sdfScene(p: vec3f) -> objectInfo {
    // return sdfGround(p, 0, vec3f(0, 0, 1));
    return sdfBox(p, vec3f(0, 0, 0), vec3f(600, 5, 600), vec3f(0, 0, 1));
}

@fragment fn render(i: vertexShaderOutput) -> @location(0) vec4f {

    let a = textureSample(waveTexture, linearSampler, i.uv);
    let b = textureSample(obstaclesTexture, linearSampler, i.uv);

    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.camDir.y), -u.camDir.x);

    var rayPos = u.camPos;
    // var raycastDist = 1000000.;
    // var raycastCol = vec3f(0);
    // var didntFindHit = false;
    // for (var i = 0; i < 1000; i++) {
    //     let nearestObject = sdfScene(rayPos);
    //     if (nearestObject.dist < 0.01) {
    //         raycastCol = nearestObject.col; 
    //         raycastDist = distance(u.camPos, rayPos);
    //         break;
    //     }
    //     rayPos += nearestObject.dist * worldDir;

    //     if (i == 999) { didntFindHit=true; }
    // }

    // if (didntFindHit) { raycastCol = vec3f(100, 170, 255)/255;}

    var nearestObject = objectInfo();
    for (var i = 0; i < 1000; i++) {
        nearestObject = sdfScene(rayPos);
        nearestObject.dist -= textureSample(waveTexture, linearSampler, rayPos.xz).r; //barely visible at the moment

        rayPos += nearestObject.dist * worldDir;
    }
    // if (nearestObject.dist > 10000) {
    //     return vec4f(vec3f(100, 170, 255)/255, 1.);
    // }
    // else {
    //     return vec4f(nearestObject.col, 1.);
    // }

    let gradientValue = textureSample(gradientTexture, linearSampler, i.uv);
    // return vec4f(gradientValue.r, gradientValue.g, 0, 1.);
    return gradientValue;

    // return vec4f(raycastCol, raycastDist);
    // return vec4f(worldDir, 1.);
}

`