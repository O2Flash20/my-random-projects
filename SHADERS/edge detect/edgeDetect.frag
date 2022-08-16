#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D tex0;
uniform vec2 uResolution;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec2 pixelIncrement = vec2(1.0 / uResolution);

    vec4 col = texture2D(tex0, uv);
    vec4 rightCol = texture2D(tex0, vec2(uv.x - pixelIncrement.x, uv.y));
    vec4 leftCol = texture2D(tex0, vec2(uv.x + pixelIncrement.x, uv.y));
    vec4 upCol = texture2D(tex0, vec2(uv.x, uv.y + pixelIncrement.y));
    vec4 downCol = texture2D(tex0, vec2(uv.x, uv.y - pixelIncrement.y));

    float threshold = 0.08;
    // vec4 drawColor = vec4(1., 1., 1., 1.);
    vec4 drawColor = vec4(0., 0., 0., 1.);

    if(distance(col, rightCol) > threshold) {
        col = drawColor;
    }
    if(distance(col, leftCol) > threshold) {
        col = drawColor;
    }
    if(distance(col, upCol) > threshold) {
        col = drawColor;
    }
    if(distance(col, downCol) > threshold) {
        col = drawColor;
    }

    // if(col != drawColor) {
    //     col = vec4(0., 0., 0., 0.);
    // }

    gl_FragColor = col;
}