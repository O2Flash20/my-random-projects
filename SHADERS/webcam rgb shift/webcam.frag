#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

// get the camera's texture in from p5
uniform sampler2D tex0;

uniform float uTime;

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;
    // uv.x = 1.0 - uv.x;

    // (r, g, b, a) of location uv of tex0
    vec4 col = texture2D(tex0, uv);
    vec4 rightCol = texture2D(tex0, vec2(uv.x - 0.01, uv.y));
    vec4 leftCol = texture2D(tex0, vec2(uv.x + 0.01, uv.y));

    // DO SOME STUFF HERE
    col.r = rightCol.r;
    col.b = leftCol.b;

    // paints the color at the corresponding location on the texture
    gl_FragColor = col;
}