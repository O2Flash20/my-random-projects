#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDistances;

// supports numbers up to 16777216 (256^3)
ivec3 toBase256(int base10Input) {
    int digit1 = int(floor(float(base10Input) / 65536.));
    int remainder1 = base10Input - digit1 * 65536;

    int digit2 = int(floor(float(remainder1) / 256.));
    int remainder2 = remainder1 - digit2 * 256;

    int digit3 = remainder2;

    return ivec3(digit1, digit2, digit3);
}

int toDecimal(ivec3 base256Input) {
    return base256Input.r * 65536 + base256Input.g * 256 + base256Input.b;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    float thisPosX = st.x * uResolution.x;
    int sum = 0;
    for (int i = 0; i < 40; i++) {
        // grab the old value
        ivec4 thisValue = ivec4(texture2D(uDistances, vec2((thisPosX + float(i)) / uResolution.x, st.y)));
        // turn it into base 10 and add it to the sum
        sum += toDecimal(ivec3(thisValue.r, thisValue.g, thisValue.b));
    }
    col = vec3(toBase256(sum * 256)) / 256.;

    gl_FragColor = vec4(col, 1.);
}

// !no workie :(