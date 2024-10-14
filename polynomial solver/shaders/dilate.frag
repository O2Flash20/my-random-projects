#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uSize;
uniform sampler2D uTex;
uniform float uTime;

const int radius = 3;
const int diameter = 2 * radius + 1;

void main() {
    vec2 uv = vTexCoord;

    vec2 xI = vec2(1, 0) / uSize;
    vec2 yI = vec2(0, 1) / uSize;

    float v = 0.;

    for (int i = -radius; i <= radius; i++) {
        for (int j = -radius; j <= radius; j++) {
            float d = 1. - clamp(length(vec2(i, j)) / (sqrt(2.) * float(radius)), 0., 1.);
            float weight = d * d * d * d + 2. * d * d + 1.;
            v += texture2D(uTex, uv + float(i) * xI + float(j) * yI).r * weight;
        }
    }
    v /= float(diameter * diameter) * 1.0471975512;

    float a = 0.5 * (sin(5.*uTime - 20. * uv.x) + 1.);

    vec3 col1 = vec3(0.57, 1, 1);
    vec3 col2 = vec3(0., 1., 0.73);

    vec3 thisCol = a*col1 + (1.-a)*col2;

    vec3 col = 1.5 * thisCol * v;

    gl_FragColor = vec4(col, v);
}