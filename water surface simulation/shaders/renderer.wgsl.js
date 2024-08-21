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
    sunDir: vec3f,
    screenSize: vec2u
}

@group(0) @binding(0) var<uniform> u: uniforms;
@group(0) @binding(1) var waveTexture: texture_2d<f32>;
@group(0) @binding(2) var gradientTexture: texture_2d<f32>;
@group(0) @binding(3) var obstaclesTexture: texture_2d<f32>;
@group(0) @binding(4) var terrainHeightTexture: texture_2d<f32>;
@group(0) @binding(5) var terrainColorTexture: texture_2d<f32>;
@group(0) @binding(6) var dampTexture: texture_2d<f32>;
@group(0) @binding(7) var cloudsTexture: texture_2d<f32>;
@group(0) @binding(8) var linearSampler: sampler;

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
    return maxTerrainHeight*(textureSample(terrainHeightTexture, linearSampler, uv).r-0.5);
}

fn getTerrainNormal(pos: vec3f) -> vec3f {
    return normalize( vec3f(
        (getTerrainHeight(pos+vec3f(-0.1, 0, 0)) - getTerrainHeight(pos+vec3f(0.1, 0, 0)))/0.2,
        1,
        (getTerrainHeight(pos+vec3f(0, 0, -0.1)) - getTerrainHeight(pos+vec3f(0, 0, 0.1)))/0.2
    ) );
}

fn getTerrainColor(pos: vec3f) -> vec3f {
    let uv = pos.xz/waterPlaneSize + vec2f(0.5);

    let a = 0.5;
    let b = 0.5;
    var dampMultiplier = b;
    if (0 < pos.y && pos.y < a) {
        dampMultiplier = -(1-b)/2 * sin(3.14159265 * (pos.y / a + 0.5)) + (1+b)/2;
    }
    else if (pos.y > a) {
        dampMultiplier = 1.;
    }

    return textureSample(terrainColorTexture, linearSampler, uv).rgb;
}

fn getTerrainDampness(pos: vec3f) -> f32 {
    let uv = pos.xz/waterPlaneSize + vec2f(0.5);
    return textureSample(dampTexture, linearSampler, uv).r;
}

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
    if (dot(lookDir, u.sunDir) > 0.999) {return vec3f(10, 10, 10);}
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

// it would feel more real if they faded into the atmosphere
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
        return 1*(c.a*(c.rgb) + (1-c.a)*s);
    }
    else {
        return 1*s;
    }
}

const waterPlaneSize = vec2f(20); //also applies for terrain

const waterPlaneHeight = 0.;
const maxWaveHeight = 0.4;
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

const terrainPlaneHeight = -0.75;
const maxTerrainHeight = 3.; //distance from lowest to highest point
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

fn getTerrainShadow(pos: vec3f, sunDir: vec3f, stepSize: f32, iterations: i32) -> f32 {
    var p = pos;
    var shadowColor = 1.;
    for (var i = 1; i <= iterations; i++) {
        p += sunDir * stepSize;
        let h = getTerrainHeight(p) + terrainPlaneHeight;
        let distToTerrain = p.y - h;
        let thisShadowAmount = clamp(10*(distToTerrain+0.05), 0, 1);
        shadowColor = min(shadowColor, thisShadowAmount);
        // if (p.y < h) { shadowColor = 0.5; }
    }

    return shadowColor;
}

// from ChatGPT
fn wavelengthToRGB(wavelength: f32) -> vec3<f32> {
    var gamma: f32 = 0.8;
    var intensity_max: f32 = 1.0;
    var factor: f32 = 0.0;
    var R: f32 = 0.0;
    var G: f32 = 0.0;
    var B: f32 = 0.0;

    if (wavelength >= 380.0 && wavelength < 440.0) {
        R = -(wavelength - 440.0) / (440.0 - 380.0);
        G = 0.0;
        B = 1.0;
    } else if (wavelength >= 440.0 && wavelength < 490.0) {
        R = 0.0;
        G = (wavelength - 440.0) / (490.0 - 440.0);
        B = 1.0;
    } else if (wavelength >= 490.0 && wavelength < 510.0) {
        R = 0.0;
        G = 1.0;
        B = -(wavelength - 510.0) / (510.0 - 490.0);
    } else if (wavelength >= 510.0 && wavelength < 580.0) {
        R = (wavelength - 510.0) / (580.0 - 510.0);
        G = 1.0;
        B = 0.0;
    } else if (wavelength >= 580.0 && wavelength < 645.0) {
        R = 1.0;
        G = -(wavelength - 645.0) / (645.0 - 580.0);
        B = 0.0;
    } else if (wavelength >= 645.0 && wavelength <= 700.0) {
        R = 1.0;
        G = 0.0;
        B = 0.0;
    } else {
        R = 0.0;
        G = 0.0;
        B = 0.0;
    }

    // Intensity correction
    if (wavelength >= 380.0 && wavelength < 420.0) {
        factor = 0.3 + 0.7 * (wavelength - 380.0) / (420.0 - 380.0);
    } else if (wavelength >= 420.0 && wavelength < 645.0) {
        factor = 1.0;
    } else if (wavelength >= 645.0 && wavelength <= 700.0) {
        factor = 0.3 + 0.7 * (700.0 - wavelength) / (700.0 - 645.0);
    }

    R = pow(R * factor, gamma);
    G = pow(G * factor, gamma);
    B = pow(B * factor, gamma);

    return vec3<f32>(R, G, B) * intensity_max;
}

fn getCaustics(pos: vec3f) -> vec3f {
    var outputColor = vec3f(0.);
    const numberOfColors = 100.;
    let step = i32((700. - 380.)/numberOfColors);

    for (var i = 380; i < 700; i += step) {
        let wavelength = f32(i)/1000;
        let w = wavelength*wavelength;

        // the index of refraction of water at this wavelength
        var n = sqrt(
            1 +
            0.5675888*w / (w-0.200491) +
            0.1720842*w / (w-0.563916) +
            0.0041020*w / (w-0.1314967)
        );

        n = 0.05*n + (1-0.05) * 1.;
        // n = 1.;

        let causticDir = refract(u.sunDir, vec3f(0, 1, 0), n);
        let causticSource = vec3f(
            (pos.y-waterPlaneHeight)/causticDir.y * causticDir.x + pos.x,
            waterPlaneHeight,
            (pos.y-waterPlaneHeight)/causticDir.y * causticDir.z + pos.z
        );
        let sourceGradient = getWaterGradient(causticSource);
        let causticAmount = pow(maxWaveHeight*length(sourceGradient.xz)*200, 2.);
        let causticColor = wavelengthToRGB(f32(i)) * causticAmount;
        outputColor += causticColor*f32(step);
    }

    return outputColor / (700. - 380.);
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

fn ACES(x: f32) -> f32 {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
fn toneMap(col: vec3f) -> vec3f {
    return vec3f(ACES(col.r), ACES(col.g), ACES(col.b));
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

    lookingAtWaterPlane = lookingAtWaterPlane && waterSamplePos.x < waterPlaneSize.x/2 && waterSamplePos.x > -waterPlaneSize.x/2 && waterSamplePos.z < waterPlaneSize.y/2 && waterSamplePos.z > -waterPlaneSize.y/2;
    lookingAtTerrainPlane = lookingAtTerrainPlane && terrainSamplePos.x < waterPlaneSize.x/2 && terrainSamplePos.x > -waterPlaneSize.x/2 && terrainSamplePos.z < waterPlaneSize.y/2 && terrainSamplePos.z > -waterPlaneSize.y/2;

    let obstacles = textureSample(obstaclesTexture, linearSampler, waterSamplePos.xz/waterPlaneSize + vec2f(0.5)).r;

    let sky = getSkyAndClouds(worldDir);

    let terrainCol = getTerrainColor(terrainSamplePos);
    let terrainShadow = getTerrainShadow(terrainSamplePos, u.sunDir, 0.05, 20);

    let terrainDampness = clamp(getTerrainDampness(terrainSamplePos)-0.1, 0, 1);
    let terrainNormal = getTerrainNormal(terrainSamplePos);
    let dampTerrainReflectDirection = reflect(worldDir, terrainNormal);
    let dampTerrainShine = clamp( pow( dot(u.sunDir, dampTerrainReflectDirection), terrainDampness*terrainDampness*terrainDampness*400 ), 0, 0.7)*terrainShadow;

    let waterShadow = getTerrainShadow(waterSamplePos, u.sunDir, 0.1, 10);

    let reflectDirection = reflect(worldDir, gradient);
    let skyReflectionColor = getSkyAndClouds(reflectDirection);

    let refractDirection = refract(worldDir, gradient, 1./1.333);
    let refractHit = raycastTerrain(waterSamplePos, refractDirection, 0.05, 50);
    let refractShadow = getTerrainShadow(refractHit, u.sunDir, 0.1, 10);

    let terrainColRefracted = getTerrainColor(refractHit);

    var causticColor = getCaustics(refractHit);
    causticColor *= refractShadow;
    causticColor = max(vec3f(0.5), causticColor);

    let distanceToWater = distance(u.camPos, waterSamplePos);
    let distanceToTerrain = distance(u.camPos, terrainSamplePos);

    var col = vec3f(0);
    if (
        (lookingAtWaterPlane && !lookingAtTerrainPlane) ||
        ((lookingAtWaterPlane && lookingAtTerrainPlane) && (distanceToWater < distanceToTerrain))
    ) { //looking at water
        let reflectance = reflectance(worldDir, gradient, 1., 1.333);

        let distThroughWater = distance(waterSamplePos, refractHit);
        let waterTransmission = exp(-distThroughWater*3);
        let waterColor = vec3f(24, 28, 5)/255;
        var refractColor = (terrainColRefracted*causticColor)*waterTransmission + waterColor*(1-waterTransmission);
        refractColor *= pow(clamp(refractShadow+0.8, 0, 1), 0.3);

        // sky color is multiplied because the sky is bright
        col = 2*skyReflectionColor * reflectance + refractColor * (1-reflectance);
        col *= clamp(waterShadow+0.8, 0, 1);
    }

    else if (
        (!lookingAtWaterPlane && lookingAtTerrainPlane) ||
        ((lookingAtWaterPlane && lookingAtTerrainPlane) && (distanceToWater > distanceToTerrain))
    ) { //looking at terrain
        let dampCol = vec3f(24, 28, 5)/255 + dampTerrainShine;
        col = (1-terrainDampness) * terrainCol  + terrainDampness * dampCol;
        col *= terrainShadow;
    }

    else { //looking at sky
        col = sky;
    }

    return vec4f(toneMap(col), 1.);
}

`