#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uOffset;

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    vec4 col = vec4(1., 1., 0., 1.);

    float yOffset = uAmplitude * (uv.x * sin((uv.x + uOffset) * uFrequency));

    col = texture2D(uTex, vec2(uv.x, uv.y + yOffset));

    gl_FragColor = col;
}