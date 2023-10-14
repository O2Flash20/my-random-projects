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

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    float thisPosY = st.y * uResolution.y;
    float sum = 0.;
    for (int i = 0; i < 40; i++) {
        sum += texture2D(uDistances, vec2(st.x, (thisPosY + float(i)) / uResolution.y)).r;
    }
    col = vec3(toBase256(int(sum * 256.))) / 256.;

    gl_FragColor = vec4(col, 1.);
}

//DISTANCES: buffer->*255?->sum->convert to "base 255" red and green channels->divide by 255 to go back to 0-1