#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform float uTime;
uniform sampler2D uImg;

// https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

float Hash(in vec2 p) {
    return fract(sin(dot(p, vec2(27.16898, 38.90563))) * 5151.5473453);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec2 thisPos = floor(uv * 100.);
    uv = mod(uv * 1000., 10.) / 10.; //convert to uv within the texture being sampled

    uv -= vec2(0.5);
    uv = rotate(uv, -uTime * Hash(thisPos) * 5.) + vec2(0.5);

    // uv = floor(uv * 10.) / 10.;

    gl_FragColor = texture2D(uImg, uv);
}