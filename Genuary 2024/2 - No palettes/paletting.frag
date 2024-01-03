#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uImg;

uniform float uHMin;
uniform float uHMax;

uniform float uSMin;
uniform float uSMax;

uniform float uLMin;
uniform float uLMax;

#ifndef saturate
#define saturate(v) clamp(v,0.,1.)
#endif

vec3 hue2rgb(float hue) {
    hue = fract(hue);
    return saturate(vec3(abs(hue * 6. - 3.) - 1., 2. - abs(hue * 6. - 2.), 2. - abs(hue * 6. - 4.)));
}

vec3 hsl2rgb(vec3 hsl) {
    if (hsl.y == 0.) {
        return vec3(hsl.z); //Luminance.
    } else {
        float b;
        if (hsl.z < .5) {
            b = hsl.z * (1. + hsl.y);
        } else {
            b = hsl.z + hsl.y - hsl.y * hsl.z;
        }
        float a = 2. * hsl.z - b;
        return a + hue2rgb(hsl.x) * (b - a);
    }
}

float map(float v, float inMin, float inMax, float outMin, float outMax) {
    return (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    uv.x = floor(uv.x * 192.) / 192.;
    uv.y = floor(uv.y * 108.) / 108.;

    vec4 col = texture2D(uImg, uv);

    col = (floor(col * 6.) / 6.) * 1.2; // *1.2 to make the brightest be white

    float h = mod(map(col.r, 0., 1., uHMin, uHMax), 1.);
    float s = mod(map(col.r, 0., 1., uSMin, uSMax), 1.);
    float l = mod(map(col.r, 0., 1., uLMin, uLMax), 1.);
    col = vec4(hsl2rgb(vec3(h, s, l)), 1.);

    gl_FragColor = col;
}
