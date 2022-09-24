#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform sampler2D uMask;
uniform vec2 uRes;

vec4 boxBlur(vec2 location, int radius, int spacing) {
    vec4 col = vec4(0.);
    // start for with 0 and go until radius*2
    for (int i = 0; i < 1000; i++) {
        if (i >= radius * 2) {
            break;
        }

        for (int j = 0; j < 1000; j++) {
            if (j >= radius * 2) {
                break;
            }

            if (texture2D(uMask, location + (vec2(i - radius, j - radius) / uRes * float(spacing))) != vec4(0., 0., 0., 1.)) {
                // blur based on mask brightness at current check location
                col += texture2D(uTex, location + (vec2(i - radius, j - radius) / uRes * float(spacing)));
            }
        }
    }

    col /= float(radius) * float(radius);

    return col;
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col1 = boxBlur(uv, 5, 1);
    vec4 col2 = boxBlur(uv, 5, 2);
    vec4 col3 = boxBlur(uv, 5, 4);

    vec4 avg = (col1 + col2 + col3) / 3.;

    gl_FragColor = avg;
}