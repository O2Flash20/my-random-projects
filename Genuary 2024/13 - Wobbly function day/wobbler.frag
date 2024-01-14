#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform float uTime;

float Hash(in vec2 p) {
    return fract(sin(dot(p, vec2(27.16898, 38.90563))) * 5151.5473453);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    float lightness = 0.;
    for (float i = 40.; i < 200.; i += 1.) {
        float xScale = Hash(vec2(i));
        float yScale = Hash(vec2(i + 1.));
        float tScale = Hash(vec2(i + 2.));
        lightness += (1.2 / i) * (sin(-xScale * i * uv.x + yScale * i * uv.y + tScale * 0.05 * i * uTime) + 0.3);
    }
    // lightness += 0.5 * (sin(uv.x + uv.y + uTime) + 1.);

    vec3 col = vec3(lightness);

    gl_FragColor = vec4(col, 1.);
}