#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uSize;
uniform vec2 uOrigin;
uniform float uScale;

uniform int uDegree;
uniform float uCoefficients[100];

float powerInt(float base, int exponent){
    float v = 1.;
    for (int i = 0; i < 100; i++) {
        if (i >= exponent) {break;}
        v*= base;
    }
    return v;
}

void main() {
    vec2 uv = vTexCoord;

    vec2 coord = uv * uSize - uOrigin;
    coord /= uScale;
    coord.y *= -1.;
    // at this point, coord is the exact coordinate as on the grid

    float value = 0.;

    float functionOutput = 0.;
    for (int i = 0; i < 100; i++) {
        if (i > uDegree) {
            break;
        }

        functionOutput += uCoefficients[i] * powerInt(coord.x, i);
    }

    if (coord.y > functionOutput) {
        value = 1.;
    }

    gl_FragColor = vec4(vec3(value), 1.);
}