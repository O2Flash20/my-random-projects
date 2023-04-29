#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uLayer;
uniform float uAmount;

const float interval = 0.005;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec3 col = vec3(1., 0., 0.);

    vec4 totalCol = vec4(0.);
    vec2 thisSample = vec2(0.);

    for (float i = 0.; i < 100.; i += interval) {
        if (i > uAmount) {
            break;
        }
        thisSample.x = i - (uAmount / 2.);

        for (float j = 0.; j < 100.; j += interval) {
            if (j > uAmount) {
                break;
            }
            thisSample.y = j - (uAmount / 2.);

            // thisSample = mod(thisSample + vec2(1.), 1.);

            totalCol += texture2D(uLayer, mod(thisSample + uv + 1., 1.));
        }
    }

    totalCol /= pow(uAmount / interval, 2.);

    gl_FragColor = totalCol;
}