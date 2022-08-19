#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uCanvas;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec4 col = vec4(uv.x, uv.y, 1., 1.);

    if(uv.x < 0.5) {
        col.r = texture2D(uCanvas, vec2(uv.x + 0.5, uv.y)).r;
        col.g = texture2D(uCanvas, uv).g;
        col.b = texture2D(uCanvas, uv).b;
    }

    gl_FragColor = col;
}