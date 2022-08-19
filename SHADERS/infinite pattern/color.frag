#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform int uTime;
uniform sampler2D uTex0;
// uniform sampler2D uTex1;

vec4 hsv(float h, float s, float v) {
    float M = v;
    float m = M * (1. - s);

    float z = (M - m) * (1. - abs(mod(h / 60., 2.) - 1.));

    float R, G, B, A;
    if(0. <= h && h < 60.) {
        R = M;
        G = z + m;
        B = m;
    }
    if(60. <= h && h < 120.) {
        R = z + m;
        G = M;
        B = m;
    }
    if(120. <= h && h < 180.) {
        R = m;
        G = M;
        B = z + m;
    }
    if(180. <= h && h < 240.) {
        R = m;
        G = z + m;
        B = M;
    }
    if(240. <= h && h < 300.) {
        R = z + m;
        G = m;
        B = M;
    }
    if(300. <= h && h < 360.) {
        R = M;
        G = m;
        B = z + m;
    }
    A = 1.;

    return vec4(R, G, B, A);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec4 col0 = texture2D(uTex0, uv);
    // vec4 col1 = texture2D(uTex1, uv);

    if(col0 != vec4(0., 0., 0., 1.)) {
        col0 = hsv(mod(360. * uv.x + float(uTime) / 1., 360.), 1., 1.);
    } else {
        // if(col1 != vec4(0., 0., 0., 1.)) {
        //     col0 = vec4(uv.x, uv.y, 1., 1.);
        // } else {
        //     col0 = vec4(0.1, 0.1, 0.1, 1.);
        // }
        col0 = hsv(mod(360. * uv.x - float(uTime) / 1., 360.), 1., 0.06);
    }

    gl_FragColor = col0;
}