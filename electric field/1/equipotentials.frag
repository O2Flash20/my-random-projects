#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uPotential;
uniform vec2 uRes;

bool isNearValue(float value, float thisValue, float upValue, float downValue, float leftValue, float rightValue) {
    if (thisValue <= value && (upValue > value || downValue > value || leftValue > value || rightValue > value)) {
        return true;
    }
    if (thisValue >= value && (upValue < value || downValue < value || leftValue < value || rightValue < value)) {
        return true;
    }
    return false;
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    vec4 thisTex = texture2D(uPotential, uv);
    vec4 upTex = texture2D(uPotential, (uv * uRes + vec2(0, 1.)) / uRes);
    vec4 downTex = texture2D(uPotential, (uv * uRes + vec2(0, -1.)) / uRes);
    vec4 leftTex = texture2D(uPotential, (uv * uRes + vec2(-1., 0)) / uRes);
    vec4 rightTex = texture2D(uPotential, (uv * uRes + vec2(1, 0)) / uRes);

    bool isOnEquipotential = false;
    for (float i = -1.; i < 1.; i += 0.05) {
        isOnEquipotential = isOnEquipotential || isNearValue(i, thisTex.r - thisTex.b, upTex.r - upTex.b, downTex.r - downTex.b, leftTex.r - leftTex.b, rightTex.r - rightTex.b);
    }

    if (isOnEquipotential) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(0., 0., 0., 1.);
    }
}