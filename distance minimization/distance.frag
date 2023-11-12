#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uPoints[100];
uniform int uNumPoints;
uniform sampler2D uDensity;

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    float lowestDist = 1000000.;
    for (int i = 0; i < 100; i++) {
        if (i >= uNumPoints) {
            break;
        }

        lowestDist = min(lowestDist, distance(st, uPoints[i] / uResolution));
    }

    // if the density is 0.5 and the nearest shop is 10 away, it should be the same as a density of 1 with a shop 10*0.5=5 away
    // the final color is multiplied by some factor or the amount of the number of points to hopefully squeeze some precision out (if these colours are too big or too small, i'm losing information due to rounding or clamping)
    col = vec3(lowestDist * texture2D(uDensity, st).r * (float(uNumPoints) / 2.), 0., 0.);

    gl_FragColor = vec4(col, 1.);
}