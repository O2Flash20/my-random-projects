#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

const float PI = 3.1415926535;

uniform float uTime;

float sinLayer(float x, float y, int a) {
    float value = 0.;
    for (int i = 0; i < 10000; i++) {
        if (i >= a) {
            break;
        }

        float rotationAngle = PI * float(i - 1) / float(a);
        value += sin(x * cos(rotationAngle) + y * sin(rotationAngle) + float(i * i));
    }
    return (1. / float(a)) * value;
}

float fractalSinNoise(float x, float y, int a, float b, int n) {
    float value = 0.;
    for (int i = 0; i < 10000; i++) {
        if (i >= n) {
            break;
        }

        value += (1. / pow(b, float(i))) * sinLayer(float(i) * x, float(i) * y, a);
    }

    return (b - 1.) * value;
}

float fixRange(float value) {
    return 0.5 * (value + 1.);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    float s = fractalSinNoise((200. * cos(uTime / 5.) + 300.) * uv.x + 100. * uTime, (200. * cos(uTime / 5.) + 300.) * uv.y, 6, 5., 10);

    gl_FragColor = vec4(vec3(fixRange(s)), 1.);
}