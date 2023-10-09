#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec4 uLines[100];
uniform int uNumLines;

// shoots a line from this pixel to (0, 0) and sees if it collides with another line
bool hitsLineSegment(vec4 line, vec2 st) {
    for (int i = 1; i <= 3; i++) {
        line[i] /= uResolution.x;
    }
    float thisSlope = st.y / st.x;
    float xVal = line[1] / (thisSlope - line[0]);

    return (xVal > line[2] && xVal < line[3]) && xVal < st.x; //all to see if it hits in the right place to be called an actual hit
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    // vec3 col = vec3(distance(st, vec2(0.)));
    vec3 col = vec3(0.);
    int lineHits = 0;
    for (int i = 0; i < 100; i++) {
        if (i >= uNumLines) {
            break;
        }
        if (hitsLineSegment(uLines[i], st)) {
            lineHits++;
        }
    }
    col = vec3(mod(float(lineHits), 2.));

    gl_FragColor = vec4(col, 1.);
}