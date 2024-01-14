#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uHeightMap;
uniform vec2 uRes;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    float thisHeight = texture2D(uHeightMap, uv).r;
    float upHeight = texture2D(uHeightMap, (uv * uRes + vec2(0., 1.)) / uRes).r;
    float downHeight = texture2D(uHeightMap, (uv * uRes + vec2(0., -1.)) / uRes).r;
    float rightHeight = texture2D(uHeightMap, (uv * uRes + vec2(1., 0.)) / uRes).r;
    float leftHeight = texture2D(uHeightMap, (uv * uRes + vec2(-1., 0.)) / uRes).r;

    vec3 col = vec3(normalize(vec2(upHeight - downHeight, rightHeight - thisHeight)), 0.);
    col = 0.5 * (col + 1.);

    gl_FragColor = vec4(col, 1.);
}