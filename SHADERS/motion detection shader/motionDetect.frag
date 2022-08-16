#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

// get the camera's texture in from p5
uniform sampler2D uInput;
uniform sampler2D uOldInput;

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    vec4 col = texture2D(uInput, uv);
    vec4 oldCol = texture2D(uOldInput, uv);

    if(distance(col, oldCol) < 0.4) {
        gl_FragColor = vec4(0., 0., 0., 1.);
    } else {
        gl_FragColor = vec4(1., 1., 1., 1.);
    }
}