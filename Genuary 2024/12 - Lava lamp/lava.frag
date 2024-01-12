#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uRes;
uniform sampler2D uTex;
uniform float uTime;

float sdfCircle(vec2 uv, vec2 pos, float radius) {
    return distance(uv, pos) - radius;
}
float sdfBox(vec2 uv, vec2 r, vec2 pos) {
    uv -= pos;
    uv = abs(uv);
    return length(max(uv - r, 0.));
}
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * (1.0 / 4.0);
}

// not my code, but it's under the "Do What The Fuck You Want To Public License" (that's a real thing im not even kidding)
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
    uv *= uRes;

    vec3 col = uv.xxy;

    float topSDF = sdfBox(uv, vec2(uRes.x, 30.), vec2(uRes.x / 2., -31));
    float bottomSDF = sdfBox(uv, vec2(uRes.x, 30.), vec2(uRes.x / 2., uRes.y + 31.));

    float lowestCircleDist = 10000.;
    for (float i = 0.; i < 10.; i++) {
        float thisDist = sdfCircle(uv, vec2(uRes.x / 2. + uRes.x / 4. * cos((uTime + (i * 13.23)) / 50.), (uRes.y) * (1.5 * sin((uTime + (i * 1231.123)) / 5.) + 1.) * 0.5), i * 2. + 40.);
        lowestCircleDist = min(thisDist, lowestCircleDist);
    }

    float dist = smin(lowestCircleDist, min(topSDF, bottomSDF), 200.);

    if (dist <= 0.) {
        float h = map(uv.y, 0., uRes.y, 0., 0.106);
        float s = map(uv.y, uRes.y / 1.05, uRes.y, 1., 0.7);
        float v = map(uv.y, 0., uRes.y, 0.2, 1.);
        col = hsv2rgb(vec3(h, s, v));
    } else {
        float v = map(pow(abs(uv.x - uRes.x / 2.), 0.9), 0., uRes.x / 2., 0.05, 0.15);
        col = hsv2rgb(vec3(0., 1, v));
    }

    gl_FragColor = vec4(col, 1.);
}