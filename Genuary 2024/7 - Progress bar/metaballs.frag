#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform float uProgress;
uniform vec2 uBalls[20];

float BALLSIZE = 0.01;

float sdfCircle(vec2 uv, vec2 pos, float radius) {
    return distance(uv, pos) - radius;
}
float sdfBox(vec2 uv, vec2 r, vec2 pos) {
    uv -= pos;
    uv = abs(uv);
    return length(max(uv - r, 0.));
}

// polynomial smooth min 2 (k=0.1)
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

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;
    vec3 col = vec3(0., 0., 0.);

    float dist = sdfBox(uv, vec2(uProgress, 0.06), vec2(0.5, 0.5));

    float distFromBalls = sdfCircle(uv, uBalls[0], BALLSIZE);
    for (int i = 1; i < 20; i++) {
        distFromBalls = min(distFromBalls, sdfCircle(uv, uBalls[i], BALLSIZE));
    }

    dist = smin(dist, distFromBalls, 0.07);

    if (dist > 0.) {
        col = vec3(0., 0., 0.);
    } else {
        col = hsv2rgb(vec3(uv.x + 5. * uProgress, 1., 1.));
    }

    gl_FragColor = vec4(col, 0.5);
}