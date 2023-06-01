#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uLayer;
uniform float uCutoff;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    // vec4 col = vec4(uv.x, uv.y, 0., 1.);

    vec4 col = texture2D(uLayer, uv);
    col.r = 1. - col.r;
    col.g = 1. - col.g;
    col.b = 1. - col.b;

    gl_FragColor = col;
}