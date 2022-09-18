#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uPos;
uniform vec2 uRes;

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

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;
    vec4 col = vec4(0., 0., 0., 1.);

    float d1 = sdfCircle(uv, vec2(0.3, 0.6), 0.1);
    float d2 = sdfCircle(uv, vec2(0.7, 0.6), 0.1);
    float d3 = sdfBox(uv, vec2(0.1, 0.1), uPos / uRes) - 0.01;
    float dist = smin(d1, d2, 0.3);
    dist = smin(dist, d3, 0.3);

    // float dist = sdfBox(uv, vec2(0.2, 0.1), vec2(0.5, 0.5));

    if(dist <= 0.) {
        col = vec4(1., 1., 1., 1.);
    } else {
        col = vec4(0., 0., 0., 1.);
    }

    gl_FragColor = col;
}