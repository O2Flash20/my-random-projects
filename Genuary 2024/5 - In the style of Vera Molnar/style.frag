#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uRes;
uniform sampler2D uTex;
uniform sampler2D uDisplacement;
uniform float uTime;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    // vec2 sample = vec2(uv.x + sin(10. * uv.x + uTime) / 15., uv.y);
    // vec4 originalCol = texture2D(uTex, sample);

    vec4 originalCol = texture2D(uTex, uv + texture2D(uDisplacement, uv).xy / 100.);

    // originalCol.rgb = 1. - originalCol.rgb;

    // originalCol.rgb = 1. - originalCol.rgb;

    gl_FragColor = originalCol;
}