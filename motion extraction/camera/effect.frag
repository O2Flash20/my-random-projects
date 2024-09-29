#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uTex;

float f(float x, float a) {
    return pow(2., a - 1.) * pow(x, a);
}

float contrastF(float v, float a) {
    if (v <= 0.5) {
        return f(v, a);
    } else {
        return 1. - f(1. - v, a);
    }
}

vec3 contrast(vec3 col, float a) {
    return vec3(
        contrastF(col.r, a),
        contrastF(col.g, a),
        contrastF(col.b, a)
    );
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col = texture2D(uTex, uv);

    gl_FragColor = vec4(
        20.*contrast(1.5*col.rgb, 1.5),
        1.
    );
}
