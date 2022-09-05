#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform vec2 uRes;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col = vec4(uv.x);

    col = texture2D(uTex, uv);

    int interations = 0;
    for(float i = -1.; i <= 1.; i++) {
        for(float j = -1.; j <= 1.; j++) {
            interations++;
            col += texture2D(uTex, uv + vec2(i / uRes.x, j / uRes.y));
        }
    }

    col /= float(interations);

    gl_FragColor = col;
}
