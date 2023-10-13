#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uPoints[100];
uniform int uNumPoints;
uniform sampler2D uMask;

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    // only do the calculations if this pixel is in the shape/mask
    if (texture2D(uMask, st).r == 1.) {
        float lowestDist = 1000.;
        for (int i = 0; i < 100; i++) {
            if (i >= uNumPoints) {
                break;
            }

            lowestDist = min(lowestDist, distance(st, uPoints[i] / uResolution));
        }

        col = vec3(lowestDist, 0., 0.);
    } else {
        col = vec3(0., 1., 0.);
    }

    gl_FragColor = vec4(col, 1.);
}