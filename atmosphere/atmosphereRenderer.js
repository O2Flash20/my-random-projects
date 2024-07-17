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
}


struct uniforms {
    camPos: vec3f,
    camDir: vec2f,
    projDist: f32,
    sunDir: vec2f,
    screenSize: vec2u
}

@group(0) @binding(0) var<uniform> u: uniforms;

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

// angle 0 is looking straight up, pi/2 is the horizon
fn getAirMass(zenithAngle: f32) -> f32 {
    let theta = zenithAngle * 57.29577951;
    return 1 / (cos(zenithAngle) + 0.50572 * pow(96.07995 - theta, -1.6364));
}

// !not used yet
// im assuming cos theta is the dot project of the direction of the ray and the sun direction
fn rayleighPhase(theta: f32) -> f32 {
    let cosTheta = cos(theta);
    return 3 * (1 + cosTheta*cosTheta) / (16 * 3.141592);
}

// fn rayleighIntensity(wavelength: f32, zenithAngle: f32) -> f32 {
//     let airMass = getAirMass(zenithAngle);
//     return airMass / pow(wavelength, 4);
// }
fn rayleighIntensity(wavelength: f32) -> f32 {
    let x = wavelength * 0.000000001;
    return 10000000 / (wavelength*wavelength*wavelength*wavelength);
}

fn mieIntensity(wavelength: f32, dotToSun: f32, g: f32, n: f32) -> f32 {
    let scatteringCoefficient = pow(wavelength, -n);
    return scatteringCoefficient * (1-g*g) / pow(1+g*g-2*g*dotToSun, 1.5); //henyey-greenstein phase function
}

// note: g and n are properties of the atmosphere
// fn getWavelengthIntensity(wavelength: f32, zenithAngle: f32, dotToSun: f32, g: f32, n: f32) -> f32 {
//     return rayleighIntensity(wavelength, zenithAngle) + mieIntensity(wavelength, dotToSun, g, n);
// }

// ray length can be air mass
const numScatteringPoints = 10;
fn calculateLight(startPos: vec3f, dir: vec3f, sunDir: vec3f, rayLength: f32) -> vec3f {
    var samplePoint = startPos;
    var stepSize = rayLength / f32(numScatteringPoints-1);
    var currentOpticalDepth = 0.;
    var transmittance = vec3f(1);
    var inScatteredLight = vec3f(0);

    let scatteringCoefficients = vec3f(rayleighIntensity(650), rayleighIntensity(510), rayleighIntensity(475));

    for (var i = 0; i < numScatteringPoints; i++) {
        let rayToSunLength = 10000.; //it really shouldnt be this
        let rayToSunOpticalDepth = getOpticalDepth(samplePoint, sunDir, rayToSunLength);
        let thisDensity = getAtmosphereDensity(samplePoint);
        currentOpticalDepth += thisDensity * stepSize;

        transmittance = exp(-(rayToSunOpticalDepth + currentOpticalDepth) * scatteringCoefficients);
        inScatteredLight += scatteringCoefficients * thisDensity * transmittance * stepSize;

        samplePoint += dir * stepSize;
    }

    return inScatteredLight;
}

const numOpticalDepthPoints = 10;
fn getOpticalDepth(startPos: vec3f, dir: vec3f, rayLength: f32) -> f32 {
    var samplePoint = startPos;
    var stepSize = rayLength / f32(numOpticalDepthPoints-1);
    var opticalDepth = 0.;

    for (var i = 0; i < numOpticalDepthPoints; i++) {
        let thisDensity = getAtmosphereDensity(samplePoint);
        opticalDepth += thisDensity * stepSize;

        samplePoint += dir * stepSize;
    }

    return opticalDepth;
}

const earthRadius = 6378137.;
const atmosphereThickness = 100000.;
fn getAtmosphereDensity(pos: vec3f) -> f32 {
    let heightAboveSurface = pos.y;
    let heightNormalized = heightAboveSurface / 10000;
    return exp(-5*heightNormalized); //5 is arbitrary
}

fn reinhard(lum: f32) -> f32 {
    return lum/(lum+1);
}

@fragment fn fs(i:vertexShaderOutput)->@location(0)vec4f{
    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.camDir.y), -u.camDir.x);

    let sunDir = rotateYaw(rotatePitch(vec3f(0, 0, 1), -u.sunDir[1]), u.sunDir[0]);
    let dotToSun = dot(worldDir, sunDir);
    let zenithAngle = atan2(length(worldDir.xz), worldDir.y);

    // let rLum = 1000*getWavelengthIntensity(650, zenithAngle, dotToSun, 0.8, 1.3);
    // let gLum = 1000*getWavelengthIntensity(510, zenithAngle, dotToSun, 0.8, 1.3);
    // let bLum = 1000*getWavelengthIntensity(475, zenithAngle, dotToSun, 0.8, 1.3);

    // let rLum = 10000000000*rayleighIntensity(650, zenithAngle);
    // let gLum = 10000000000*rayleighIntensity(510, zenithAngle);
    // let bLum = 10000000000*rayleighIntensity(475, zenithAngle);

    // let rLum = 500*mieIntensity(650, dotToSun, 0.8, 1.3) + 5000000000*rayleighIntensity(650, zenithAngle);
    // let gLum = 500*mieIntensity(510, dotToSun, 0.8, 1.3) + 5000000000*rayleighIntensity(510, zenithAngle);
    // let bLum = 500*mieIntensity(475, dotToSun, 0.8, 1.3) + 5000000000*rayleighIntensity(475, zenithAngle); 

    // let lumTot = rLum + gLum + bLum;

    // return vec4f(reinhard(rLum), reinhard(gLum), reinhard(bLum), 1);
    // return vec4f(dotToSun);

    // return vec4f(getAirMass(zenithAngle)/100);

    if (dotToSun > 0.999) {
        return vec4f(1);
    }
    else {
        return vec4f(
            normalize(calculateLight(u.camPos, worldDir, sunDir, 10000.)),
            1
        );
    }

}

`

/*
sample points in the view direction, for each of those points sample points towards the sun, get transmittance using beers law and multiply the depth by each colour's scattering coefficient
color += density * transmittance * scattering coefficient * stepsize

if i could estimate the result of sampling points on a ray for density, i could have no loops
*/