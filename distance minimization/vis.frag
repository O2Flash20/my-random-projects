#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDist;
uniform sampler2D uDensity;
uniform int uNumPoints;
uniform vec4 uKeyColors[6];

// not my code, but it's under the "Do What The Fuck You Want To Public License" (that's a real thing im not even kidding)
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// two functions to get the multi-colored effect i'm looking for
vec3 mapVec(float v, vec3 v1, vec3 v2) {
    vec3 outVec;
    outVec.r = (v) * (v2.r - v1.r) + v1.r;
    outVec.g = (v) * (v2.g - v1.g) + v1.g;
    outVec.b = (v) * (v2.b - v1.b) + v1.b;
    return outVec;
}
vec3 colorRamp(vec4 colors[6], float value) {
    vec3 outCol;
    if (value < colors[0].r) {
        outCol = colors[0].gba;
    }
    if (value > colors[5].r) {
        outCol = colors[5].gba;
    } else {
        for (int i = 0; i < 6 - 1; i++) {
            if (value < colors[i + 1].r && colors[i].r < value) {
                outCol = mapVec((value - colors[i].r) / (colors[i + 1].r - colors[i].r), colors[i].gba, colors[i + 1].gba);
                break;
            }
        }
    }
    return outCol;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    // doing a little posterizing effect to get bands of colour
    float posterizeAmount = 5.;
    float thisDist = texture2D(uDist, st).r;
    thisDist /= (posterizeAmount / 255.);
    thisDist = floor(thisDist) * (posterizeAmount / 255.);

    // multiply the distances by some function of the number of points to make it look better
    float distMultiple = 20. / (float(uNumPoints) + 1.) + 1.;
    vec3 col = hsv2rgb(colorRamp(uKeyColors, thisDist * distMultiple));
    col *= texture2D(uDensity, st).r;

    gl_FragColor = vec4(col, 1.);
}