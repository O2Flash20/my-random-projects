#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform vec2 uRes;

const float radius = 30.;
const float increment = 2.;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec3 col = vec3(uv.x);

    vec3 blurColor = vec3(0.);
    for (float i = -radius; i <= radius; i += increment) {
        for (float j = -radius; j <= radius; j += increment) {
            float d = sqrt(i * i + j * j);
            if (radius >= d) {
                blurColor += (radius - d) * texture2D(uTex, (uv * uRes + vec2(i, j)) / uRes).rgb;
            }
        }
    }
    blurColor /= 3.1415 * radius * radius * radius / 3.; //volume of a cone: the weights above are in the shape of a cone (a simple distance)
    blurColor *= increment * increment;

    blurColor = hsv2rgb(vec3(0.7, 0.7, blurColor.x * 6.));

    vec3 widenedColor = vec3(0.);
    for (float i = -1.; i <= 1.; i++) {
        for (float j = -1.; j <= 1.; j++) {
            vec3 thisTexCol = texture2D(uTex, (uv * uRes + vec2(i, j)) / uRes).rgb;
            if (thisTexCol.r > widenedColor.r) {
                widenedColor = thisTexCol;
            }
        }
    }

    gl_FragColor = vec4(blurColor + widenedColor, 1.);
}