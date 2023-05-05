#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform int uType;
uniform sampler2D uLayer1;
uniform sampler2D uLayer2;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col = vec4(1., 0., 0., 1.);

    // additive
    if (uType == 0) {
        col = texture2D(uLayer1, uv) + texture2D(uLayer2, uv);
    }

    gl_FragColor = col;
}