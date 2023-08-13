#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCameraPos;
uniform vec3 uCameraRot;

// CONTROLS
const int MaxMarchingSteps = 1000;
const float MinDist = 0.0;
const float MaxDist = 500.0;
const float Epsilon = 0.001; //the distance needed to be considered "hitting"

const float pi = 3.1415926535897932384226;
const float verticalFOV = radians(70.);
const float horizontalFOV = 2. * atan((16. / 9.) * (tan(verticalFOV / 2.)));

const vec3 sunDir = normalize(vec3(1., 1., 0.));
const vec3 sunColor = vec3(1.0);
const vec3 backgroundColor = vec3(0.58, 0.87, 1.0);
const vec3 ambientColor = backgroundColor * 0.2;

struct Material {
    vec3 baseColor;
    float roughness;
    float specularStrength;
};

struct Surface {
    float sd;
    Material mat;
};

// https://www.shadertoy.com/view/4sfGzS
float hash(vec3 p) {
    p = fract(p * 0.3183099 + .1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float hash1d(float x) {
    vec3 p = vec3(x);
    p = fract(p * 0.3183099 + .1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

float fbmNoise(vec3 x) {
    return (0.5 * noise(x / 8.) + 0.25 * noise(x / 4.) + 0.125 * noise(x / 2.) + 0.0625 * noise(x));
}

float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return (outMax - outMin) * (value - inMin) / (inMax - inMin) + outMin;
}

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(vec3(1, 0, 0), vec3(0, c, -s), vec3(0, s, c));
}

mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(vec3(c, 0, s), vec3(0, 1, 0), vec3(-s, 0, c));
}

mat3 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(vec3(c, -s, 0), vec3(s, c, 0), vec3(0, 0, 1));
}

mat3 rotateXYZ(vec3 pitchYawRoll) {
    return rotateX(pitchYawRoll.x) * rotateY(pitchYawRoll.y) * rotateZ(pitchYawRoll.z);
}

mat3 rotateNone() {
    return mat3(vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
}

Surface surfaceMin(Surface surf1, Surface surf2) {
    if (surf1.sd < surf2.sd) {
        return surf1;
    }
    return surf2;
}

// https://www.shadertoy.com/view/tscBz8
Surface surfaceSmin(Surface surf1, Surface surf2, float k) {
    float interpolation = clamp(0.5 + 0.5 * (surf2.sd - surf1.sd) / k, 0.0, 1.0);
    vec3 baseColorMix = mix(surf2.mat.baseColor, surf1.mat.baseColor, interpolation);
    float roughnessMix = mix(surf2.mat.roughness, surf1.mat.roughness, interpolation);
    float specularStrengthMix = mix(surf2.mat.specularStrength, surf1.mat.specularStrength, interpolation);
    float sdMix = mix(surf2.sd, surf1.sd, interpolation) - k * interpolation * (1.0 - interpolation);

    return Surface(sdMix, Material(baseColorMix, roughnessMix, specularStrengthMix));
}

Surface Box(vec3 p, vec3 position, vec3 size, float roundness, mat3 transform, Material mat) {
    p = (p - position) * transform;
    vec3 q = abs(p) - size;
    return Surface(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - roundness, mat);
}

Surface Sphere(vec3 p, vec3 position, float radius, Material mat) {
    return Surface(length(p - position) - radius, mat);
}

Surface HalfCylinder(vec3 p, vec3 position, float radius, float height, mat3 transform, Material mat) {
    p = (p - position) * transform;
    p.y -= height;
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(radius, height);
    return Surface(min(max(d.x, d.y), 0.0) + length(max(d, 0.0)), mat);
}

Surface FloorPlane(vec3 p, float height, Material mat) {
    return Surface(p.y - height, mat);
}

// !not used?
Surface Branch(vec3 p, vec3 position, float radius, float height, float noiseAmount, mat3 transform, Material mat) {
    p = (p - position) * transform;
    vec2 pn = normalize(p.xz) * 4.; // *4 for more detail and a vertical stretch
    Surface co = HalfCylinder(p, vec3(0.), radius, height, rotateNone(), mat);
    co.sd += noiseAmount * (2. * fbmNoise(vec3(pn.x, pn.y, p.y)) - 1.);
    return co;
}

Surface Tree(vec3 p, vec3 position, float seed, mat3 transform, Material mat) {
    p = (p - position) * transform;
    Surface co = HalfCylinder(p, vec3(0.), 0.2, 5., rotateNone(), mat);
    // Surface co = Branch(p, vec3(0.), 0.2, 5., 0.5, rotateNone(), mat);
    for (int i = 1; i < 10; i++) {
        float branchLength = mapRange(hash1d(seed * float(i)), 0., 1., 1., 2.3);
        mat3 branchRotation = rotateY(hash1d(seed * float(i) + pi) * 2. * pi) * rotateZ(1.);
        Surface newBranch = HalfCylinder(p, vec3(0., float(i), 0.), 0.1, branchLength, branchRotation, mat);
        // Surface newBranch = Branch(p, vec3(0., float(i), 0.), 0.1, branchLength, 0.1, branchRotation, mat);
        co = surfaceSmin(newBranch, co, 0.1);
    }
    return co;
}

Surface GrassField(vec3 p, float height, Material mat) {
    const float gS = 1.; // grass spacing
    const float gS2 = gS * 2.;
    vec3 pnew = p;
    pnew.xz = mod(p.xz, gS2);
    vec2 grassCoordinate = floor(p.xz / gS2) * gS2;
    pnew.xz += mapRange(noise(vec3(grassCoordinate * 10., 0.1)), 0., 1., -gS, gS);
    pnew.xz += mapRange(fbmNoise(vec3(grassCoordinate, uTime / 20.)), 0., 1., -gS, gS) * (p.y - height) * (p.y - height) * 0.5;
    Material grassMat = Material(vec3(0.02, 0.47, 0.0), 0.8, 1.);
    float random = noise(vec3(grassCoordinate, 1.) * 10.);
    Surface grass = Box(pnew, vec3(gS, height, gS), vec3(0.1, 2., 0.005), 0.01, rotateY(random * pi), grassMat);
    grass.sd *= Epsilon * 200.;

    return grass;
}

vec3 directionFromUV(vec2 uv) {
    const float tanF2 = tan(horizontalFOV / 2.);
    const float tanZ2 = tan(verticalFOV / 2.);

    return normalize(vec3(mapRange(uv.x, 0., 1., -tanF2, tanF2), mapRange(uv.y, 0., 1., -tanZ2, tanZ2), 1.));
}

vec3 dirToWorldDir(vec3 dir, vec3 cameraRot) {
    return dir * rotateXYZ(cameraRot);
}

Surface sceneSDF(vec3 p) {
    // *tree
    // vec3 pnew = p;
    // pnew.xz += 20. * sin(uTime / 200.) * pow(p.y / 50., 2.);
    // Material treeMat = Material(vec3(0.27, 0.13, 0.02), 0.7, 0.2);
    // float seed = hash1d(floor(length(p) / 20.));
    // Surface co = Tree(pnew, vec3(0.), seed, rotateNone(), treeMat);

    // Material groundMat = Material(vec3(0.02, 0.23, 0.04), 1., 0.1);
    // co = surfaceMin(co, FloorPlane(p, 0., groundMat));

    // return co;

    // *grass field
    float groundHeight = 5. * fbmNoise(vec3(p.xz / 2., 1.));

    Material grassMat = Material(vec3(0.02, 0.47, 0.0), 0.8, 1.);
    Surface grass = GrassField(p, groundHeight, grassMat);
    grass = surfaceMin(grass, GrassField(p - vec3(1., 0., 0.4), groundHeight, grassMat));

    Material groundMat = Material(vec3(0.21, 0.15, 0.01) * fbmNoise(p * 10.), 1., 0.01);
    Surface ground = FloorPlane(p, groundHeight, groundMat);

    return surfaceMin(grass, ground);
}

vec3 estimateNormal(in vec3 p) {
    vec2 e = vec2(1.0, -1.0) * 0.0005; // epsilon
    return normalize(e.xyy * sceneSDF(p + e.xyy).sd +
        e.yyx * sceneSDF(p + e.yyx).sd +
        e.yxy * sceneSDF(p + e.yxy).sd +
        e.xxx * sceneSDF(p + e.xxx).sd);
}

vec3 shadeSurface(Surface surface, vec3 rayDirection, vec3 rayPosition, vec3 normal) {
    vec3 reflectedDir = reflect(rayDirection, normal);

    vec3 ambient = ambientColor * surface.mat.baseColor;

    float lambertian = max(0., dot(normal, sunDir));
    vec3 diffuse = lambertian * surface.mat.baseColor * sunColor;

    float specularDot = max(0., dot(reflectedDir, sunDir));
    float specularPow = mapRange(surface.mat.roughness, 0., 1., 200., 1.);
    vec3 specular = clamp(pow(specularDot, specularPow), 0., surface.mat.specularStrength) * sunColor;

    return diffuse + ambient + specular;
    // return ref;
}

// shoots a ray out into the scene and returns essentially a depth map (+each point's nearest color)
vec3 rayMarch(vec3 cameraPos, vec3 rayDirection, float startDepth, float endDepth) {
    float depth = startDepth;
    Surface co; //"closest object"

    for (int i = 0; i < MaxMarchingSteps; i++) {
        vec3 p = cameraPos + rayDirection * depth;
        co = sceneSDF(p);

        if (abs(co.sd) < Epsilon) { //hit something!
            return shadeSurface(co, rayDirection, p, estimateNormal(p));
        }

        if (depth > endDepth) {
            // break; // go to return sky
            return backgroundColor;
        }

        depth += co.sd;
    }

    // returning sky color
    // co.sd = depth;
    // return backgroundColor;
    return co.mat.baseColor;

    // return vec3(depth / 10.);
}

void main() {
    vec2 uv = vTexCoord;

    vec3 rayDirection = dirToWorldDir(directionFromUV(uv), uCameraRot);

    gl_FragColor = vec4(rayMarch(uCameraPos, rayDirection, MinDist, MaxDist), 1.);
}

/*
TODO:
controls on Tree and Branch
sun shadows
*/