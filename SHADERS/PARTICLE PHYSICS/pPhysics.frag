#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uRes;
uniform sampler2D uLastFrame;

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    vec3 col = vec3((uv.x * uRes.x) / 255., (uv.y * uRes.y) / 255., 0.);

    gl_FragColor = vec4(col, 1.);
}