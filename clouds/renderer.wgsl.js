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

const pi  = 3.1415926535;

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

fn getCloudDensity(worleyTexture: texture_3d<f32>, samplePoint: vec3f, offsets: array<vec3f, 4>) -> f32 {
    // let noiseValue = 1. - textureSample(worleyTexture, texSampler, samplePoint / 200.);
    let level1 = 1. - textureSample(worleyTexture, texSampler, samplePoint + offsets[0]).r;
    let level2 = 1. - textureSample(worleyTexture, texSampler, samplePoint + offsets[1]).g;
    let level3 = 1. - textureSample(worleyTexture, texSampler, samplePoint + offsets[2]).b;
    let level4 = 1. - textureSample(worleyTexture, texSampler, samplePoint + offsets[3]).a;
    return 0.0625 * level1 + 0.125 * level2 + 0.25 * level3 + 0.5 * level4;
}

const numCloudSamples = 4;
fn getCloudSamplePoints(dir: vec3f, pos: vec3f, cloudBottom:f32, cloudTop:f32) -> array<vec3f, numCloudSamples> {
    var output = array<vec3f, numCloudSamples>();
    for (var i = 0; i < numCloudSamples; i++){
        let thisHeight = ( cloudTop-cloudBottom ) * ( f32(2 * i + 1)/f32(2 * numCloudSamples) ) + cloudBottom;
        let thisPos = vec3f(
            dir.x/dir.y * (thisHeight-pos.y) + pos.x,
            thisHeight,
            dir.z/dir.y * (thisHeight-pos.y) + pos.z,
        );
        output[i] = thisPos;
    }

    return output;
}

@fragment fn fs(fsi:vertexShaderOutput)->@location(0)vec4f{
    let timeSec = f32(time)/1000.;
    let p = camera.position;
    let d = camera.direction;

    /* todo: cast multiple rays for anti-aliasing
        could be done with workgroups?
        also at that point do depth of field
    */

    const sunDir = normalize(vec3f(0., -1., -3.));

    let screenDir = uvToScreenDir(fsi.uv, camera.projectionDist);

    let worldDir = rotate3d(screenDir, d.x, d.y);

    var col = vec3f(0., 0., 0.);

    // if(p.y < 0){ //under the ground
    //     col = vec3(0.2);
    // }
    // else if (worldDir.y < 0.) { //looking at the ground
    //     let groundHitPos = vec3f(worldDir.x / worldDir.y * p.y, 0., worldDir.z / worldDir.y * p.y) + camera.position;
    //     col = vec3f(0.2, 0.2, 0.2); //ground color
    //     let sunSpecular = max(dot(reflect(worldDir, vec3f(0., 1., 0.1*sin(groundHitPos.z))), -sunDir), 0.);
    //     col += pow(sunSpecular, 30);
    // }else{ //looking up at the sky
    //     let dotToSun = dot(worldDir, sunDir);
    //     if (dotToSun < -0.999){
    //         col = vec3f(1., 1., 1.); //looking at the sun
    //     }
    //     else{
    //         col = vec3f(0.0, 0.5, 1.0); //some color for the sky
    //         col += 0.5*vec3f(1.0-worldDir.y); //add some more light on the horizon
    //         col += -0.2*vec3f(dotToSun*dotToSun*dotToSun); //add some more light around the sun
    //     }
    // }

    const cloudHeightBottom = 100.;
    const cloudHeightTop = 400.;
    if (p.y < cloudHeightBottom){
        let cloudBottomHit = vec3f(
            worldDir.x/worldDir.y * (cloudHeightBottom-p.y) + p.x,
            100.,
            worldDir.z/worldDir.y * (cloudHeightBottom-p.y) + p.z,
        );

        let cloudOffsets = array<vec3f, 4>(
            vec3f(timeSec/40., 0, 0),
            vec3f(timeSec/80., 0, 0),
            vec3f(timeSec/160., 0, 0),
            vec3f(timeSec/320., 0, 0)
        );
        // TODO: get cloud densities at a set amount of points spread across the cloud volume evenly

        let cloudSamplePoints = getCloudSamplePoints(worldDir, p, cloudHeightBottom, cloudHeightTop);

        var avgDensity = 0.;
        for (var i = 0; i < numCloudSamples; i++){
            avgDensity += getCloudDensity(worleyNoise, cloudSamplePoints[i]/1000., cloudOffsets);
        }
        avgDensity /= numCloudSamples;

        col = vec3f(avgDensity);

        // col = vec3f(getCloudDensity(worleyNoise, cloudBottomHit/1000., cloudOffsets));
    }

    return vec4f(col, 1.);

    // return textureSample(worleyNoise, texSampler, vec3f(fsi.uv, timeSec/10 % 1.)*vec3f(3., 3., 1.));
}

`