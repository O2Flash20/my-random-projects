#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform vec2 uRes;

const float radius = 2.;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec3 widenedColor = vec3(0.);
    for (float i = -radius; i <= radius; i += 1.) {
        for (float j = -radius; j <= radius; j += 1.) {
            if (radius >= sqrt(i * i + j * j)) {
                vec3 thisTexCol = texture2D(uTex, (uv * uRes + vec2(i, j)) / uRes).rgb;
                if (thisTexCol.r > widenedColor.r) {
                    widenedColor = thisTexCol;
                }
            }
        }
    }

    gl_FragColor = vec4(widenedColor, 1.);
}