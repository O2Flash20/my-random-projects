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
@group(0) @binding(4) var terrainTexture: texture_2d<f32>;
@group(0) @binding(5) var cloudsTexture: texture_2d<f32>;
@group(0) @binding(6) var linearSampler: sampler;

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

fn getTerrainHeight(pos: vec3f) -> f32 {
    let uv = pos.xz/waterPlaneSize + vec2f(0.5);
    let textureValue = maxTerrainHeight*(textureSample(terrainTexture, linearSampler, uv)-0.5);
    return textureValue.r;
}

const sunDir = normalize(vec3f(1, 1, 0));

fn mapRange(value: f32, inMin: f32, inMax: f32, outMin: f32, outMax: f32) -> f32 {
    return (value-inMin)/(inMax-inMin)*(outMax-outMin) + outMin;
}

fn mixColor(mix: f32, col1: vec3f, col2: vec3f) -> vec3f {
    return (1-mix)*col1 + mix*col2;
}

fn colorRamp(mix: f32, col1: vec4f, col2: vec4f, col3: vec4f, col4: vec4f) -> vec3f {
    if (mix <= col1.w) { return col1.rgb; }
    if (col1.w < mix && mix <= col2.w) { return mixColor(mapRange(mix, col1.w, col2.w, 0, 1), col1.rgb, col2.rgb); }
    if (col2.w < mix && mix <= col3.w) { return mixColor(mapRange(mix, col2.w, col3.w, 0, 1), col2.rgb, col3.rgb); }
    if (col3.w < mix && mix <= col4.w) { return mixColor(mapRange(mix, col3.w, col4.w, 0, 1), col3.rgb, col4.rgb); }
    else {return col4.rgb;}
}

fn getSkyColor(lookDir: vec3f) -> vec3f {
    let angleUp = atan2(lookDir.y, length(lookDir.xz));
    let skyIndex = 2*angleUp/3.14159265; //-1 to 1
    let skyColor = colorRamp(
        skyIndex,
        vec4f(0.1, 0.1, 0.1, -0.2),
        vec4f(vec3f(161, 249, 255)/255, 0),
        vec4f(vec3f(88, 192, 252)/255, 0.5),
        vec4f(vec3f(1, 102, 156)/255, 1),
    );
    return vec3f(skyColor);
}

fn getClouds(lookDir: vec3f) -> vec4f {
    // project onto some plane in the sky
    let a = 0.05 / lookDir.y;
    let textureSamplePos = vec2f(
        lookDir.x * a,
        lookDir.z * a
    ) + vec2f(0.5);

    let v = textureSample(cloudsTexture, linearSampler, textureSamplePos);

    if (textureSamplePos.x < 0 || textureSamplePos.x > 1 || textureSamplePos.y < 0 || textureSamplePos.y > 1) { return vec4f(0); }
    return v;
}

fn getSkyAndClouds(lookDir: vec3f) -> vec3f {
    let s = getSkyColor(lookDir);
    let c = getClouds(lookDir);

    if (lookDir.y > 0) {
        return c.a*(c.rgb) + (1-c.a)*s;
    }
    else {
        return s;
    }
}

const waterPlaneSize = vec2f(20); //also applies for terrain

const waterPlaneHeight = 0.;
const maxWaveHeight = 0.2;
fn raycastWater(startPos:vec3f, dir: vec3f, startStepSize: f32, iterations: i32) -> vec3f {
    var pos = startPos;
    var step = startStepSize;

    for (var i = 0; i < iterations; i++) {
        let waterHeight = getWaterHeight(pos) + waterPlaneHeight;
        if (waterHeight < pos.y) {
            // hasn't hit water, keep moving forward
            pos += step * dir;
        }
        else {
            // sample pos is under the water, step back to find the boundary
            step *= 0.5;
            pos -= step * dir;
        }
    }

    return pos;
}

const terrainPlaneHeight = -1;
const maxTerrainHeight = 4.; //distance from lowest to highest point
fn raycastTerrain(startPos:vec3f, dir: vec3f, startStepSize: f32, iterations: i32) -> vec3f {
    var pos = startPos;
    var step = startStepSize;

    for (var i = 0; i < iterations; i++) {
        let terrainHeight = getTerrainHeight(pos) + terrainPlaneHeight;
        if (terrainHeight < pos.y) {
            // hasn't hit water, keep moving forward
            pos += step * dir;
        }
        else {
            // sample pos is under the water, step back to find the boundary
            step *= 0.5;
            pos -= step * dir;
        }
    }

    return pos;
}

// 1: all reflection, 0: all refraction
fn reflectance(incident: vec3f, normal: vec3f, n1: f32, n2: f32) -> f32 {
    let n = n1/n2;
    let cosI = -dot(normal, incident);
    let sinT2 = n*n*(1-cosI*cosI);
    if (sinT2 > 1) { return 1.; } //total internal reflection
    let cosT = sqrt(1-sinT2);
    let rOrthogonal = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
    let rParallel = (n2 * cosI - n1 * cosT) / (n2 * cosI + n1 * cosT);
    return clamp((rOrthogonal * rOrthogonal + rParallel * rParallel) / 2, 0, 1);
}


@fragment fn render(i: vertexShaderOutput) -> @location(0) vec4f {
    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.camDir.y), -u.camDir.x);

    var lookingAtWaterPlane = (worldDir.y < 0 && u.camPos.y > waterPlaneHeight) || (worldDir.y >= 0 && u.camPos.y <= waterPlaneHeight);
    var lookingAtTerrainPlane = (worldDir.y < 0 && u.camPos.y > terrainPlaneHeight+maxTerrainHeight/2) || (worldDir.y >= 0 && u.camPos.y <= terrainPlaneHeight+maxTerrainHeight/2);

    let opw = waterPlaneHeight+maxWaveHeight/2;
    let waterPlaneProjPos = vec3f(
        worldDir.x * (opw-u.camPos.y)/worldDir.y + u.camPos.x,
        opw,
        worldDir.z * (opw-u.camPos.y)/worldDir.y + u.camPos.z,
    );

    let opt = terrainPlaneHeight+maxTerrainHeight/2;
    let terrainPlaneProjPos = vec3f(
        worldDir.x * (opt-u.camPos.y)/worldDir.y + u.camPos.x,
        opt,
        worldDir.z * (opt-u.camPos.y)/worldDir.y + u.camPos.z,
    );

    let waterSamplePos = raycastWater(waterPlaneProjPos, worldDir, 1., 20);
    let terrainSamplePos = raycastTerrain(terrainPlaneProjPos, worldDir, 1., 20);

    var gradient = getWaterGradient(waterSamplePos);
    gradient *= vec3f(maxWaveHeight, 1, maxWaveHeight);
    gradient = normalize(gradient);
    let dotToSun = pow(dot(gradient, sunDir), 5.);

    lookingAtWaterPlane = lookingAtWaterPlane && waterSamplePos.x < waterPlaneSize.x/2 && waterSamplePos.x > -waterPlaneSize.x/2 && waterSamplePos.z < waterPlaneSize.y/2 && waterSamplePos.z > -waterPlaneSize.y/2;
    lookingAtTerrainPlane = lookingAtTerrainPlane && terrainSamplePos.x < waterPlaneSize.x/2 && terrainSamplePos.x > -waterPlaneSize.x/2 && terrainSamplePos.z < waterPlaneSize.y/2 && terrainSamplePos.z > -waterPlaneSize.y/2;

    let obstacles = textureSample(obstaclesTexture, linearSampler, waterSamplePos.xz/waterPlaneSize + vec2f(0.5)).r;

    let sky = getSkyAndClouds(worldDir);

    let reflectDirection = reflect(worldDir, gradient);
    let skyReflectionColor = getSkyAndClouds(reflectDirection);

    let refractDirection = refract(worldDir, gradient, 1./1.333);
    let refractHit = raycastTerrain(waterSamplePos, refractDirection, 0.05, 50);

    let distanceToWater = distance(u.camPos, waterSamplePos);
    let distanceToTerrain = distance(u.camPos, terrainSamplePos);

    var col = vec3f(0);
    if (
        (lookingAtWaterPlane && !lookingAtTerrainPlane) ||
        ((lookingAtWaterPlane && lookingAtTerrainPlane) && (distanceToWater < distanceToTerrain))
    ) { //looking at water
        let reflectance = reflectance(worldDir, gradient, 1., 1.333);

        let refractColor = vec3f(-refractHit.y-0.2)*vec3f(0.2, 0.2, 0);
        col = skyReflectionColor * reflectance + refractColor * (1-reflectance);
    }
    else if (
        (!lookingAtWaterPlane && lookingAtTerrainPlane) ||
        ((lookingAtWaterPlane && lookingAtTerrainPlane) && (distanceToWater > distanceToTerrain))
    ) { //looking at terrain
        col = vec3f(terrainSamplePos.y+0.5);
    }
    else { //looking at sky
        col = sky;
    }

    return vec4f(col, 1.);
}

`