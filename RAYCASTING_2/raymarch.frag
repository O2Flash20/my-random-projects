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
const float MaxDist = 1000.0;
const float Epsilon = 0.001; //the distance needed to be considered "hitting"

const float pi = 3.1415926535897932384226;
const float verticalFOV = radians(70.);
const float horizontalFOV = 2. * atan((16. / 9.) * (tan(verticalFOV / 2.)));

struct Surface {
    float sd;
    vec3 col;
};

float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return (outMax - outMin) * (value - inMin) / (inMax - inMin) + outMin;
}

Surface surfaceMin(Surface surf1, Surface surf2) {
    if (surf1.sd < surf2.sd)
        return surf1;
    return surf2;
}

Surface surfaceSmin(Surface surf1, Surface surf2, float k) {
    float hSD = max(k - abs(surf1.sd - surf2.sd), 0.0) / k;
    float newSD = min(surf1.sd, surf2.sd) - hSD * hSD * k * (1.0 / 4.0);

    vec3 newCol = vec3(0.);
    if (surf1.sd < surf2.sd) {
        newCol = surf1.col;
    }
    if (surf1.sd > surf2.sd) {
        newCol = surf2.col;
    }

    return Surface(newSD, newCol);
}

Surface sdfBox(vec3 p, vec3 position, vec3 size, float roundness, mat3 transform, vec3 color) {
    p = (p - position) * transform;
    vec3 q = abs(p) - size;
    return Surface(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - roundness, color);
}

Surface sdfSphere(vec3 p, vec3 position, float radius, vec3 color) {
    return Surface(length(p - position) - radius, color);
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

vec3 directionFromUV(vec2 uv) {
    const float tanF2 = tan(horizontalFOV / 2.);
    const float tanZ2 = tan(verticalFOV / 2.);

    return normalize(vec3(mapRange(uv.x, 0., 1., -tanF2, tanF2), mapRange(uv.y, 0., 1., -tanZ2, tanZ2), 1.));
}

vec3 dirToWorldDir(vec3 dir, vec3 cameraRot) {
    return dir * rotateXYZ(cameraRot);
}

Surface sceneSDF(vec3 p) {
    Surface box = sdfBox(p, vec3(0., 0., 10.), vec3(1., 2., 1.), 1., rotateNone(), vec3(1.0, 0.65, 0.0));
    Surface sphere = sdfSphere(p, vec3(10., 1., 9.), 10., vec3(0.81, 0.11, 0.6));
    return surfaceSmin(box, sphere, 0.5);
}

vec3 estimateNormal(in vec3 p) {
    vec2 e = vec2(1.0, -1.0) * 0.0005; // epsilon
    return normalize(e.xyy * sceneSDF(p + e.xyy).sd +
        e.yyx * sceneSDF(p + e.yyx).sd +
        e.yxy * sceneSDF(p + e.yxy).sd +
        e.xxx * sceneSDF(p + e.xxx).sd);
}

// shoots a ray out into the scene and returns essentially a depth map (+each point's nearest color)
Surface rayMarch(vec3 cameraPos, vec3 rayDirection, float startDepth, float endDepth) {
    float depth = startDepth;
    Surface co; //"closest object"

    for (int i = 0; i < MaxMarchingSteps; i++) {
        vec3 p = cameraPos + rayDirection * depth;
        co = sceneSDF(p);
        depth += co.sd;
        if (co.sd < Epsilon || depth > endDepth)
            break;
    }

    co.sd = depth;

    return co;
}

const vec3 sunDir = normalize(vec3(1., 1., 0.));
void main() {
    vec2 uv = vTexCoord;

    vec3 color = vec3(uv.x, uv.y, 1.);

    vec3 rayDirection = dirToWorldDir(directionFromUV(uv), uCameraRot);

    Surface closestObject = rayMarch(uCameraPos, rayDirection, MinDist, MaxDist);
    float rayHitDepth = closestObject.sd;
    vec3 rayHitCol = closestObject.col;
    vec3 rayHitPos = uCameraPos + rayDirection * closestObject.sd;
    vec3 rayHitNormal = estimateNormal(rayHitPos);

    if (closestObject.sd > MaxDist) {
        color = vec3(0.58, 0.87, 1.0);
    } else {
        color = rayHitCol;
        color += max(dot(rayHitNormal, sunDir), 0.) * 0.6;
    }

    gl_FragColor = vec4(color, 1.);
}

/*
TODO:
better color mixing with surfaceSmin
*/