#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;

float sdBox(vec2 p, vec2 b, vec2 pos) {
    p -= pos;
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;

    vec3 col = vec3(st.x, st.y, 0.);

    float mixAmount = sdBox(st, vec2(0.2, 0.1), vec2(0.5));
    mixAmount *= 20.;
    if (0. < mixAmount && mixAmount < 1.) {
        mixAmount *= 2. * mixAmount;
    }
    mixAmount = clamp(mixAmount, 0., 0.8);
    mixAmount += 0.2;

    col = col * mixAmount;

    gl_FragColor = vec4(col, 1.);
}