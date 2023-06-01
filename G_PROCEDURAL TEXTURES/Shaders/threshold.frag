#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uLayer;
uniform float uCutoff;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col = vec4(uv.x, uv.y, 0., 1.);

    col = texture2D(uLayer, uv);

    if ((col.r + col.g + col.b) / 3. < uCutoff) {
        col = vec4(0., 0., 0., 1.);
    } else {
        col = vec4(1.);
    }

    gl_FragColor = col;
}