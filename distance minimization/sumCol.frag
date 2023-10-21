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

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    float thisPosY = gl_FragCoord.y * 40.;
    float sum = 0.;
    for (int i = 0; i < 40; i++) {
        sum += texture2D(uDistances, vec2(st.x, (thisPosY + float(i)) / 600.)).r;
    }
    col = vec3(toBase255(floor(sum * 255.))) / 255.;

    gl_FragColor = vec4(col, 1.);
}