#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 uResolution;
uniform float uTime;

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

Surface sdfBox(vec3 p, vec3 position, vec3 size, mat3 transform, vec3 col) {
    p = (p - position) * transform;
    vec3 q = abs(p) - size;
    return Surface(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), col);
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

mat3 identity() {
    return mat3(vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
}

vec3 directionFromUV(vec2 uv) {
    const float tanF2 = tan(horizontalFOV / 2.);
    const float tanZ2 = tan(verticalFOV / 2.);

    return normalize(vec3(mapRange(uv.x, 0., 1., -tanF2, tanF2), mapRange(uv.y, 0., 1., -tanZ2, tanZ2), 1.));
}

Surface sceneSDF(vec3 p) {
    return sdfBox(p, vec3(10. * sin(uTime / 20.), cos(uTime / 10.), 10.), vec3(1., 2., 1.), rotateX(10.), vec3(0., 1., 1.));
}

vec3 raycastCol(vec3 cameraPos, vec3 direction) {
    vec3 point = cameraPos;

    for (int i = 0; i < MaxMarchingSteps; i++) {
        Surface co = sceneSDF(point);
        if (co.sd <= Epsilon) {
            return co.col;
        } else {
            point += direction * co.sd;
        }
    }
    return vec3(0.);
}

void main() {
    vec2 uv = vTexCoord;

    vec3 col = vec3(uv.x, uv.y, 1.);

    vec3 dir = directionFromUV(uv);

    col = raycastCol(vec3(0.), dir);

    gl_FragColor = vec4(col, 1.);
}
