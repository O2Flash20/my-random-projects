#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uRes;
uniform vec2 uCanvasPos;
uniform vec2 uMousePos;

vec4 hsv(float h, float s, float v) {
    for(int i = 0; i < 1000; i++) {
        if(h >= 0.) {
            break;
        }
        h += 360.;
    }
    h = mod(h, 360.);

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

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    float h = 240. + uv.y * 120.;
    float s = 1.;
    float v = 1.;

    vec2 mouseUV = vec2((uMousePos) / uRes);

    // float val = 3720. * (-((mouseUV.x - uv.x) * (mouseUV.x - uv.x)) - ((mouseUV.y - uv.y) * (mouseUV.y - uv.y))) + 270.;
    float val = 30. - distance(mouseUV, uv) * 100.;
    if(val > 0.) {
        h += val;
    }

    vec4 col = hsv(h, s, v);

    gl_FragColor = col;
}