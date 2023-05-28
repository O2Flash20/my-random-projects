#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

float Hash(in vec2 p, in float scale) {
	// This is tiling part, adjusts with the scale...
    p = mod(p, scale);
    return fract(sin(dot(p, vec2(27.16898, 38.90563))) * 5151.5473453);
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec3 col = vec3(Hash(uv, 1.));

    gl_FragColor = vec4(col, 1);
}