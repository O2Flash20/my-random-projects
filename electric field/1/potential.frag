#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec3 uCharges[3];

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    float electricPotential = 0.;
    for (int i = 0; i < 3; i++) {
        electricPotential += 9000000000. * uCharges[i].z / distance(uCharges[i].xy, uv) / 500.;
    }

    gl_FragColor = vec4(electricPotential, 0., -electricPotential, 1.);
}