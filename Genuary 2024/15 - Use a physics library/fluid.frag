#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uPos[320];
uniform vec2 uRes;

float sdfCircle(vec2 uv, vec2 pos, float radius) {
    return distance(uv, pos) - radius;
}
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * (1.0 / 4.0);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    uv *= uRes;

    float d = sdfCircle(uv, uPos[0], 5.);
    for (int i = 1; i < 320; i++) {
        d = smin(d, sdfCircle(uv, uPos[i], 5.), 100.);
    }

    vec3 col = clamp(vec3(1. - d), 0., 1.) * vec3(0., 0.3, 1.);

    gl_FragColor = vec4(col, 1.);
}