#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDistances;

// supports numbers up to 16581375 (255^3)
vec3 toBase255(float base10Input) {
    float digit1 = floor(base10Input / 65025.);
    float remainder1 = base10Input - digit1 * 65025.;

    float digit2 = floor(remainder1 / 255.);
    float remainder2 = remainder1 - digit2 * 255.;

    float digit3 = remainder2;

    return vec3(digit1, digit2, digit3);
}

float toDecimal(vec3 base255Input) {
    return base255Input.r * 65025. + base255Input.g * 255. + base255Input.b;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    float thisPosX = gl_FragCoord.x * 40.;
    float sum = 0.;
    for (int i = 0; i < 40; i++) {
        // grab the old value
        vec4 thisValue = vec4(texture2D(uDistances, vec2((thisPosX + float(i)) / 600., gl_FragCoord.y / 15.))) * 255.;
        // turn it into base 10 and add it to the sum
        sum += toDecimal(vec3(thisValue.r, thisValue.g, thisValue.b));
    }
    col = toBase255(sum) / 255.;

    gl_FragColor = vec4(col, 1.);
}