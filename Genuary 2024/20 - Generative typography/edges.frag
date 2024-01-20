#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform vec2 uRes;

const float threshold = 0.346;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    //posterize, then edge detect
    vec3 thisCol = floor(vec3(texture2D(uTex, uv).rgb) * 5.) / 5.;
    vec3 upCol = floor(vec3(texture2D(uTex, (uv * uRes + vec2(0., 1.)) / uRes).rgb) * 5.) / 5.;
    vec3 downCol = floor(vec3(texture2D(uTex, (uv * uRes + vec2(0., -1.)) / uRes).rgb) * 5.) / 5.;
    vec3 leftCol = floor(vec3(texture2D(uTex, (uv * uRes + vec2(-1., 0.)) / uRes).rgb) * 5.) / 5.;
    vec3 rightCol = floor(vec3(texture2D(uTex, (uv * uRes + vec2(1., 0.)) / uRes).rgb) * 5.) / 5.;
    vec3 col = vec3(0.);
    if (distance(thisCol, upCol) > threshold || distance(thisCol, downCol) > threshold || distance(thisCol, leftCol) > threshold || distance(thisCol, rightCol) > threshold) {
        col = vec3(1.);
    }

    gl_FragColor = vec4(col, 1.);
}