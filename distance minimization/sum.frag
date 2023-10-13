#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDepth;

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.y = 1. - st.y;

    vec3 col = vec3(0.);

    // for (int i = 0; i < 100000; i++) {
    //     if (i >= int(uResolution.y)) {
    //         break;
    //     }

    //     vec4 sample = texture2D(uDepth, vec2(st.x, i/int(uResolution.y)));
    //     if(sample.b)
    // }

    gl_FragColor = vec4(col, 1.);
}

//DISTANCES: buffer->*255?->sum->convert to "base 255" red and green channels->divide by 255 to go back to 0-1