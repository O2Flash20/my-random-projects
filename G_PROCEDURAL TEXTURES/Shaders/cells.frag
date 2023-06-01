#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform int uNumberOfPoints;
uniform int uExposure;
uniform int uSeed;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    float recordDist = 1.;

    vec3 col = vec3(1., 0., 0.);

    // "dynamic indexing" i love gpu ahah
    for (int i = 0; i < 10000; i++) {
        if (i >= uNumberOfPoints) {
            break;
        }

        // original point in center tile
        vec2 thisPoint = vec2(random(vec2(uSeed * 12312 + i, 0.)), random(vec2(uSeed * 12312 + i, 0.5)));

        // tile the point around
        for (int j = -1; j <= 1; j++) {
            for (int k = -1; k <= 1; k++) {
                vec2 thisPointTiled = thisPoint + vec2(j, k);

                float distToThisPoint = distance(thisPointTiled, uv);
                if (distToThisPoint < recordDist) {
                    recordDist = distToThisPoint;
                }
            }
        }
    }

    col = vec3(recordDist) * vec3(uExposure);

    gl_FragColor = vec4(col, 1.);
}