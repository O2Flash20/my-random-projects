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
    height /= 2.;
    p = (p - position) * transform;
    p.y -= height;
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(radius, height);
    return Surface(min(max(d.x, d.y), 0.0) + length(max(d, 0.0)), mat);
}

Surface Vesica(vec3 p, vec3 position, float r, float d, float width, mat3 transform, Material mat) {
    p = (p - position) * transform;
    float sd;
    vec2 p2d = p.xz;
    p2d = abs(p2d);
    float b = sqrt(r * r - d * d);
    sd = ((p2d.y - b) * d > p2d.x * b) ? length(p2d - vec2(0.0, b)) : length(p2d - vec2(-d, 0.0)) - r;
    sd = max(sd, abs(p.y) - width);
    Surface vesica = Surface(sd, mat);
    return vesica;
}

Surface Leaf(vec3 p, vec3 position, float height, float width, float roundness, mat3 transform, Material leafMat, Material branchMat) {
    p = (p - position) * transform;
    float ra1 = height;
    float ra2 = roundness;
    // float wid = max(0.5, ra1);
    float wid = 0.36;

    Surface vesica = Vesica(p, vec3(0., 0.565, 0.), wid, ra1, width, rotateX(pi / 2.), leafMat);
    vesica.sd -= (ra2);

    Surface branchEnd = HalfCylinder(p, vec3(0.), 0.01, 0.4, rotateNone(), branchMat);

    return surfaceMin(vesica, branchEnd);
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

Surface Tree(vec3 p, vec3 position, float height, int numBranches, int numLeaves, float seed, mat3 transform, Material barkMat, Material leafMat) {
    p = (p - position) * transform;
    Surface co = HalfCylinder(p, vec3(0.), 0.2, height, rotateNone(), barkMat); //trunk
    for (int i = 1; i < 100; i++) { //branches
        if (i > numBranches) {
            break;
        }

        float maxBranchLength = mapRange(p.y / height, 0., 1., 1., 0.2);
        float branchLength = mapRange(hash1d(seed * float(i)), 0., 1., 1., maxBranchLength * 15.);
        mat3 branchRotation = rotateY(hash1d(seed * float(i) + pi) * 2. * pi) * rotateZ(1.);
        float branchHeight = float(i) / float(numBranches) * height;

        Surface newBranch = HalfCylinder(p, vec3(0., branchHeight, 0.), 0.05, branchLength, branchRotation, barkMat);
        co = surfaceSmin(newBranch, co, 0.1);

        for (int j = 0; j < 100; j++) { //leaves
            if (j > numLeaves) {
                break;
            }
            float leafSeed = seed * float(j) * float(i);

            float leafSpotOnBranch = hash1d(leafSeed * 20.2313) * branchLength;
            mat3 leafRotation = rotateX(hash1d(leafSeed) * pi * 2.) * rotateZ(hash1d(leafSeed * 2.) * pi * 2.) * rotateY(hash1d(leafSeed * 3.) * pi * 2.);

            vec3 p1 = ((p - vec3(0., branchHeight, 0.)) * branchRotation - vec3(0., leafSpotOnBranch, 0.)) * leafRotation; //put the leaf onto its branch
            Surface leaf = Leaf(p1, vec3(0.), 0.3, 0.005, 0., rotateNone(), leafMat, barkMat);
            co = surfaceMin(co, leaf);

        }
    }
    return co;
}

Surface GrassField(vec3 p, float height, float grassSpacing, float grassHeight, Material mat) {
    float gS = grassSpacing;
    float gS2 = gS * 2.;
    vec3 pnew = p;
    pnew.xz = mod(pnew.xz, gS2);
    vec2 grassCoordinate = floor(p.xz / gS2) * gS2;
    pnew.xz += mapRange(noise(vec3(grassCoordinate * 10., 0.1)), 0., 1., -gS, gS); //grass offset
    pnew.xz += mapRange(fbmNoise(vec3(grassCoordinate, uTime)), 0., 1., -gS, gS) * (p.y - height) * (p.y - height) * 100.; //wind sway
    Material grassMat = Material(vec3(0.02, 0.47, 0.0), 0.8, 1.);
    float random = noise(vec3(grassCoordinate, 1.) * 10.); //random for the rotation
    Surface grass = Box(pnew, vec3(gS, height + grassHeight / 2., gS), vec3(0.005, grassHeight, 0.002), 0.001, rotateY(random * pi), grassMat);
    // grass.sd *= Epsilon * 200.;

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
    // vec2 treeIndex = floor(p.xz / 10.) * 10.;
    // pnew.xz += 20. * sin(uTime + length(treeIndex)) * pow(p.y / 50., 2.); //sway
    // pnew.xz = mod(pnew.xz, 10.);
    // pnew.xz -= 5.;
    // float seed = hash1d(floor(length(p) / 20.));

    // Material treeMat = Material(vec3(0.27, 0.13, 0.02), 0.7, 0.2);
    // Material leafMat = Material(vec3(0.0, 0.19, 0.06), 0.4, 1.);
    // Surface co = Tree(pnew, vec3(0.), 10., 10, 7, seed, rotateNone(), treeMat, leafMat);

    // Material groundMat = Material(vec3(0.0, 0.44, 0.04) * fbmNoise(p * 20.), 1., 0.01);
    // co = surfaceSmin(co, FloorPlane(p, 0., groundMat), 0.2);
    // co = surfaceMin(co, GrassField(p, 0., 0.02, 0.07 * fbmNoise(p * 100.) * 2., groundMat));

    // return co;

    // *grass field
    // float groundHeight = 5. * fbmNoise(vec3(p.xz / 2., 1.));

    // Material grassMat = Material(vec3(0.02, 0.47, 0.0), 0.8, 0.3);
    // Surface grass = GrassField(p, groundHeight, 0.5, 3., grassMat);

    // Material groundMat = Material(vec3(0.0, 0.44, 0.04) * fbmNoise(p * 20.), 1., 0.01);
    // Surface ground = FloorPlane(p, groundHeight, groundMat);

    // return surfaceMin(grass, ground);

    // *leaf
    // Material leafMat = Material(vec3(0.0, 0.33, 0.14), 0.6, 0.3);
    // Material branchMat = Material(vec3(0.25, 0.12, 0.0), 0.2, 1.);
    // // p.y += pow(p.z, 2.) * 0.2 * sin(uTime / 20.);//branch sway
    // Surface leaf = Leaf(p, vec3(0.), 0.32, 0.01, 0.0, rotateNone(), leafMat, branchMat);

    // return leaf;

    // // Surface bark = HalfCylinder(p, vec3(0., -1., 0.), 0.1, 2., rotateNone(), branchMat);
    // // return surfaceSmin(leaf, bark, 0.1);

    // *render demo
    Material sphereMat = Material(vec3(0.0, 0.32, 1.0), 0., 1.);
    Material boxMat = Material(vec3(mod(p.x * p.y, 0.5)), 0.5, 1.);
    vec3 groundColor = vec3(mod(floor(p.x), 2.) * mod(floor(p.z), 2.), 0., 0.);
    Material groundMat = Material(groundColor, 0.9, (groundColor.x + 0.3) / 1.3);
    Surface s = Sphere(p, vec3(0., 3., 0.), 1., sphereMat);
    Surface b = Box(p, vec3(1., 3.5, 0.), vec3(0.5), 0.1, rotateNone(), boxMat);
    Surface f = FloorPlane(p, 0., groundMat);
    Surface co = surfaceSmin(s, b, 0.5);
    return surfaceMin(co, f);
}

vec3 estimateNormal(in vec3 p) {
    vec2 e = vec2(1.0, -1.0) * 0.0005; // epsilon
    return normalize(e.xyy * sceneSDF(p + e.xyy).sd +
        e.yyx * sceneSDF(p + e.yyx).sd +
        e.yxy * sceneSDF(p + e.yxy).sd +
        e.xxx * sceneSDF(p + e.xxx).sd);
}

vec3 shadeSurface(Surface surface, vec3 rayDirection, vec3 hitPosition, vec3 normal) {
    vec3 normalMap = vec3(fbmNoise(hitPosition * 5.) * 10., 1., 0.); //?
    vec3 reflectedDir = reflect(rayDirection, normalize(normal + normalMap));

    vec3 ambient = ambientColor * surface.mat.baseColor;

    float lambertian = max(0., dot(normal, sunDir));
    vec3 diffuse = lambertian * surface.mat.baseColor * sunColor;

    float specularDot = max(0., dot(reflectedDir, sunDir));
    float specularPow = mapRange(surface.mat.roughness, 0., 1., 200., 1.);
    vec3 specular = pow(specularDot, specularPow) * surface.mat.specularStrength * sunColor;

    return diffuse + ambient + specular;
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
sun shadows
normal maps, calculated only on a hit
good procedural textures
did i do normal maps right?
the ablitity to have refletive materials, say one bounce
*/