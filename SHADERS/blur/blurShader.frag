#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uTex;
uniform vec2 uRes;
uniform sampler2D uMap;
uniform float uTotal;
uniform vec2 uMapRes;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col = vec4(0.);

    for (int i = 0; i < 1000; i++) {
        if (i >= int(uMapRes.x)) {
            break;
        }
        for (int j = 0; j < 1000; j++) {
            if (j >= int(uMapRes.y)) {
                break;
            }

            float s = float(i) / (uMapRes.x - 1.);
            float t = float(j) / (uMapRes.y - 1.);
            // get the value at that point in the map and make sure that all adds up to 1 (*255./uTotal)
            vec4 val = texture2D(uMap, vec2(s, t)) * 255. / uTotal;

            // get the relative location of the selected pixel
            vec2 pixelChange = vec2(float(i) - (uMapRes.x - 1.) / 2., float(j) - (uMapRes.y - 1.) / 2.);
            pixelChange /= uRes;

            vec4 selCol = texture2D(uTex, uv + pixelChange);
            selCol *= val;

            col += selCol;
        }
    }

    gl_FragColor = col;
}
