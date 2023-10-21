#ifdef GL_ES
precision mediump float;
#endif

uniform float Number;

// supports numbers up to 16581375 (255^3)
vec3 toBase256(float base10Input) {
    float digit1 = floor(base10Input / 65025.);
    float remainder1 = base10Input - digit1 * 65025.;

    float digit2 = floor(remainder1 / 255.);
    float remainder2 = remainder1 - digit2 * 255.;

    float digit3 = remainder2;

    return vec3(digit1, digit2, digit3);
}

float toDecimal(vec3 base256Input) {
    return base256Input.r * 65025. + base256Input.g * 255. + base256Input.b;
}

void main() {
    // gl_FragColor = vec4(1., 0., 0., 1.);
    gl_FragColor = vec4(toBase256(Number) / 255., 1.);
}