#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uHeight;
uniform sampler2D uNormal;
uniform sampler2D uRocks;
uniform vec2 uRes;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return clamp((outMax - outMin) * (value - inMin) / (inMax - inMin) + outMin, min(outMin, outMax), max(outMin, outMax));
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    float height = texture2D(uHeight, uv).r;
    // doing a box blur on the normals to smooth them
    vec2 normal = vec2(0., 0.);
    for (float i = -2.; i <= 2.; i++) {
        for (float j = -2.; j <= 2.; j++) {
            normal += 2. * texture2D(uNormal, (uv * uRes + vec2(i, j)) / uRes).rg - 1.;
        }
    }
    normal /= 25.;

    vec3 col = hsv2rgb(vec3(0.55, 1., height));
    col += vec3(pow(height, 15.));

    col = 0.6 * col + 0.4 * texture2D(uRocks, uv + normal / 200.).rgb;

    gl_FragColor = vec4(col, 1.);
}