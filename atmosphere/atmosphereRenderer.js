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

//-----------------------------------------------------------------------------

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

// !not used yet
// im assuming cos theta is the dot project of the direction of the ray and the sun direction
fn rayleighPhase(theta: f32) -> f32 {
    let cosTheta = cos(theta);
    return 3 * (1 + cosTheta*cosTheta) / (16 * 3.141592);
}

fn rayleighIntensity(wavelength: f32) -> f32 {
    let x = wavelength * 0.000000001;
    return 1000000 / (wavelength*wavelength*wavelength*wavelength);
}

fn henyeyGreenstein(dotToSun: f32, g: f32) -> f32 {
    return 0.79577474*(1-g*g)/pow(1+g*g-2*g*dotToSun, 1.5);
    // that first constant is 1/4π
}
fn mieIntensity(wavelength: f32, dotToSun: f32, g: f32, n: f32) -> f32 {
    let scatteringCoefficient = pow(wavelength, -n);
    return scatteringCoefficient * henyeyGreenstein(dotToSun, g);
}

const numScatteringPoints = 10;
fn calculateLight(startPos: vec3f, dir: vec3f, sunDir: vec3f) -> vec4f {
    let camPos = vec3f(0, startPos.y+earthRadius, 0);
    let atmosphereSampleInfo = getAtmosphereSampleInfo(camPos, dir);
    if (atmosphereSampleInfo.x==0 && atmosphereSampleInfo.y==0 && atmosphereSampleInfo.z==0 && atmosphereSampleInfo.w==0) {return vec4f(0, 0, 0, 0);}
    let rayLength = atmosphereSampleInfo[3];
    var stepSize = rayLength / f32(numScatteringPoints-1);

    var currentOpticalDepth = 0.;
    var transmittance = vec3f(1);
    var inScatteredLight = vec3f(0);

    let scatteringCoefficients = vec3f(rayleighIntensity(650), rayleighIntensity(510), rayleighIntensity(475));

    var samplePoint = atmosphereSampleInfo.xyz;
    for (var i = 0; i < numScatteringPoints; i++) {
        let rayToSunLength = getAtmosphereSampleInfo(samplePoint, sunDir).a; //at this point i know i'm in the atmosphere, no need to use .xyz
        let rayToSunOpticalDepth = getOpticalDepth(samplePoint, sunDir, rayToSunLength);
        let thisDensity = getAtmosphereDensity(samplePoint);
        currentOpticalDepth += thisDensity * stepSize;

        transmittance = exp(-(rayToSunOpticalDepth + currentOpticalDepth) * scatteringCoefficients);

        if (!doesRayIntersectSphere(samplePoint, sunDir, vec3f(0), earthRadius)) { //only add light if this point can see the sun
            inScatteredLight += scatteringCoefficients * thisDensity * transmittance * stepSize;
        }

        samplePoint += dir * stepSize;
    }

    // add in mie scattering
    inScatteredLight *= 2000*vec3f(
        mieIntensity(650, dot(dir, sunDir), 0.3, 1.1),
        mieIntensity(510, dot(dir, sunDir), 0.3, 1.1),
        mieIntensity(475, dot(dir, sunDir), 0.3, 1.1)
    );

    return vec4f(inScatteredLight, 1-transmittance.r);
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

const earthRadius = 6378.;
const atmosphereThickness = 300.;

fn getAtmosphereDensity(pos: vec3f) -> f32 {
    let heightAboveSurface = length(pos)-earthRadius;
    let heightNormalized = (heightAboveSurface / atmosphereThickness);
    return 200*exp(-5*heightNormalized); //5 is arbitrary
}

// returns the distance to a sphere
fn raySphereIntersection(rayOrigin: vec3f, rayDir: vec3f, sphereCenter: vec3f, sphereRadius: f32) -> array<f32, 2> {
    let a = pow(dot(rayDir, rayOrigin-sphereCenter), 2) - (pow(length(rayOrigin - sphereCenter), 2)-sphereRadius*sphereRadius);

    if (a < 0) { return array<f32, 2>(-1, -1); } //not looking at the sphere, reject entirely

    let d1 = -dot(rayDir, rayOrigin-sphereCenter) + sqrt(a);
    let d2 = -dot(rayDir, rayOrigin-sphereCenter) - sqrt(a);

    return array<f32, 2>(d1, d2);
}

fn doesRayIntersectSphere(rayOrigin: vec3f, rayDir: vec3f, sphereCenter: vec3f, sphereRadius: f32) -> bool {
    let a = pow(dot(rayDir, rayOrigin-sphereCenter), 2) - (pow(length(rayOrigin - sphereCenter), 2)-sphereRadius*sphereRadius);
    if (a < 0) { return false; }

    let d1 = -dot(rayDir, rayOrigin-sphereCenter) + sqrt(a);
    let d2 = -dot(rayDir, rayOrigin-sphereCenter) - sqrt(a);
    return (d1 >= 0 || d2 >= 0); //if at least one solution is positive, there's an intersection
}

// the first 3 dimensions are the starting point, the last is the distance through the atmosphere
fn getAtmosphereSampleInfo(camPos: vec3f, worldDir: vec3f) -> vec4f {
    // arrays of 2 distance values, if a value is negative it should be rejected
    let distToGround = raySphereIntersection(camPos, worldDir, vec3f(0), earthRadius);
    let distToAtmosphereEdge = raySphereIntersection(camPos, worldDir, vec3f(0), earthRadius+atmosphereThickness);

    // if it exists, the nearest non-negative distance to both the atmosphere and the ground. if it doesn't exist this wont be used anyways
    let nearAtmosphereDist = sp(distToAtmosphereEdge[0], distToAtmosphereEdge[1]);
    let nearGroundDist = sp(distToGround[0], distToGround[1]);

    if (distToGround[0] < 0 && distToGround[1] < 0 && distToAtmosphereEdge[0] < 0 && distToAtmosphereEdge[1] < 0 ) {return vec4f(0);} //not looking at the atmosphere at all
    else if (distToGround[0] < 0 && distToGround[1] < 0) { // looking at space through the atmosphere
        if (distToAtmosphereEdge[0] < 0) {return vec4f(camPos, distToAtmosphereEdge[1]);}
        else if (distToAtmosphereEdge[1] < 0) {return vec4f(camPos, distToAtmosphereEdge[0]);}
        else { //looking into then back out of the atmosphere
            let nearAtmosphereHitPos = vec3f(camPos + worldDir*min(distToAtmosphereEdge[0], distToAtmosphereEdge[1]));
            let farAtmosphereHitPos = vec3f(camPos + worldDir*max(distToAtmosphereEdge[0], distToAtmosphereEdge[1]));
            return vec4f(nearAtmosphereHitPos, distance(nearAtmosphereHitPos, farAtmosphereHitPos));
        }
    }
    // im pretty sure it's impossible to be looking at the ground but not the atmosphere, because the ground is contained within the atmosphere
    // at this point each distance should have at least one positive value
    else if (nearGroundDist <= nearAtmosphereDist) {return vec4f(camPos, nearGroundDist);} //in the atmosphere but looking at the ground (or underground)
    else { //in space, looking at the atmosphere and then the ground below it (distToAtmosphereEdge < distToGround)
        let atmosphereHitPos = vec3f(camPos + worldDir*nearAtmosphereDist);
        let groundHitPos = vec3f(camPos + worldDir*nearGroundDist);
        return vec4f(atmosphereHitPos, distance(atmosphereHitPos, groundHitPos));
    }
}

// "smallest positive" assumes at least one value is positive
fn sp(value1: f32, value2: f32) -> f32 {
    if (value1 < 0) {return value2;}
    else if (value2 < 0) {return value1;}
    else {return min(value1, value2);}
}

fn reinhardToneMapping(color: vec3<f32>) -> vec3<f32> {
    return color / (color + vec3<f32>(1.0));
}

@fragment fn fs(i:vertexShaderOutput)->@location(0)vec4f{
    let screenDir = uvToScreenDir(i.uv, u.projDist, f32(u.screenSize.y)/f32(u.screenSize.x));
    let worldDir = rotateYaw(rotatePitch(screenDir, -u.camDir.y), -u.camDir.x);

    let sunDir = rotateYaw(rotatePitch(vec3f(0, 0, 1), -u.sunDir[1]), u.sunDir[0]);
    let dotToSun = dot(worldDir, sunDir);
    let zenithAngle = atan2(length(worldDir.xz), worldDir.y);

    var surroundingColor = vec3f(0);
    if (dotToSun > 0.999) {
        surroundingColor = vec3f(10);
    }

    let a = calculateLight(u.camPos, worldDir, sunDir);
    let col = surroundingColor*(1-a.a) + a.rgb;
    return vec4f(reinhardToneMapping(col), 1);
}

`