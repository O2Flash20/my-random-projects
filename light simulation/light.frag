#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;
uniform vec2 uRes;
uniform float uLights[3];
uniform vec3 uLight1;
uniform vec3 uLight2;
uniform vec3 uLight3;
uniform sampler2D uDustMap;

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    vec4 col = texture2D(uDustMap, uv) / 4.;
    // vec4 col = vec4(0., 0., 0., 1.);

    for(int i = 0; i < 3; i++) {
        float lightPos = float(uLights[i]) / float(uRes.x);
        float angle = atan((uv.x - lightPos) / uv.y);

        float spread = 100.;

        float lightAmt = (1. - abs(degrees(angle) / spread)) - distance(uv, vec2(lightPos, 0.)) / 2.;
        // float lightAmt = 1. - distance(uv, vec2(lightPos, 0.));

        vec3 light;
        if(i == 0) {
            light = uLight1;
        }
        if(i == 1) {
            light = uLight2;
        }
        if(i == 2) {
            light = uLight3;
        }

        float a = (uv.y / (uv.x - lightPos));
        float b = -(a * lightPos);
        float barrierLevel = 0.2;
        float xAtBarrier = (barrierLevel - b) / a;

        if(uv.y > barrierLevel) {
            if(xAtBarrier > 0.2 && xAtBarrier < 0.3) {
                lightAmt *= 0.;
            }
            if(xAtBarrier > 0.6 && xAtBarrier < 0.8) {
                lightAmt *= 0.;
            }
        }

        float lightCaught = 0.2;
        lightCaught = texture2D(uDustMap, uv).r + 0.2;
        col.r += ((light.r / 255.) * lightAmt) * lightCaught;
        col.g += ((light.g / 255.) * lightAmt) * lightCaught;
        col.b += ((light.b / 255.) * lightAmt) * lightCaught;
        // col += vec4(lightAmt);
    }

    gl_FragColor = col;
}