#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

// get the camera's texture in from p5
uniform sampler2D uInput;
uniform sampler2D uOldInput;
uniform vec2 uRes;

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    vec4 col = texture2D(uInput, uv);
    vec4 oldCol = texture2D(uOldInput, uv);

    if(distance(col, oldCol) < 0.4) {
        gl_FragColor = texture2D(uInput, uv);
        // gl_FragColor = vec4(1.);
    } else {
        for(float i = -5.; i < 5.; i++) {
            for(float j = -5.; j < 5.; j++) {
                col += texture2D(uInput, vec2(uv.x + (i * 2. / uRes.x), uv.y + (j * 2. / uRes.y)));
            }
        }
        col /= 100.;
        gl_FragColor = col;
    }
}