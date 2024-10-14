#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uSize;
uniform sampler2D uTex;

void main() {
    vec2 uv = vTexCoord;

    float isEdge = 0.;

    vec2 uvUp = vec2(0, 1)/uSize;
    vec2 uvRight = vec2(1, 0)/uSize;

    float thisValue = texture2D(uTex, uv).r;

    if (
        thisValue != texture2D(uTex, uv+uvUp).r
        ||
        thisValue != texture2D(uTex, uv-uvUp).r 
        ||
        thisValue != texture2D(uTex, uv+uvRight).r
        ||
        thisValue != texture2D(uTex, uv-uvRight).r
    ) {
        isEdge = 1.;
    }

    gl_FragColor = vec4(vec3(isEdge), 1.);
}