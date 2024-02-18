#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec3 uCharges[3];

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec2 field = vec2(0);
    for (int i = 0; i < 3; i++) {
        vec2 chargeDirection = normalize(uCharges[i].xy - uv);
        field -= 9000000000. * uCharges[i].z / pow(distance(uCharges[i].xy, uv), 2.) * chargeDirection / 500.;
    }

    gl_FragColor = vec4(field, -field);
}