#ifdef GL_ES
precision highp float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform sampler2D uPotential;
uniform vec2 uRes;
uniform vec2 uOriginalRes;
uniform float uTime;

float fromBase256(vec4 base256) {
    vec4 b = base256 * 255.; //bring it back to its original [0-256] instead of [0-1]
    float val = b.x + b.y * 256. + b.z * 256. * 256. + b.w * 256. * 256. * 256.;
    return val - 2147483648.; //to get negative numbers back
}

vec4 toBase256(float inputValue) {
    inputValue += 2147483648.; //256^4/2, this is to make negative numbers able to be encoded

    // Extract four base-256 digits from the floating-point input
    float digit1 = mod(inputValue, 256.0);
    float digit2 = mod(floor(inputValue / 256.0), 256.0);
    float digit3 = mod(floor(inputValue / (256.0 * 256.0)), 256.0);
    float digit4 = mod(floor(inputValue / (256.0 * 256.0 * 256.0)), 256.0);

    // Normalize the digits to the range [0, 1]
    digit1 /= 255.0;
    digit2 /= 255.0;
    digit3 /= 255.0;
    digit4 /= 255.0;

    return vec4(digit1, digit2, digit3, digit4);
}

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    // getting the four nearest pixels in the original buffer
    vec2 p = uv * uOriginalRes; //pixel on the original image
    vec2 topLeftS = vec2(floor(p.x), floor(p.y)) + 0.5;
    vec2 topRightS = vec2(ceil(p.x), floor(p.y)) + 0.5;
    vec2 bottomLeftS = vec2(floor(p.x), ceil(p.y)) + 0.5;
    vec2 bottomRightS = vec2(ceil(p.x), ceil(p.y)) + 0.5;

    float topLeftPot = fromBase256(texture2D(uPotential, topLeftS / uOriginalRes));
    float topRightPot = fromBase256(texture2D(uPotential, topRightS / uOriginalRes));
    float bottomLeftPot = fromBase256(texture2D(uPotential, bottomLeftS / uOriginalRes));
    float bottomRightPot = fromBase256(texture2D(uPotential, bottomRightS / uOriginalRes));
    // good up until here

    float root2 = sqrt(2.);
    float topLeftScore = 1. - distance(p, topLeftS - 0.5) / root2; // a score (0->1)
    float topRightScore = 1. - distance(p, topRightS - 0.5) / root2;
    float bottomLeftScore = 1. - distance(p, bottomLeftS - 0.5) / root2;
    float bottomRightScore = 1. - distance(p, bottomRightS - 0.5) / root2;
    float totalScore = topLeftScore + topRightScore + bottomLeftScore + bottomRightScore;

    float interpolatedVal = (topLeftPot * topLeftScore + topRightPot * topRightScore + bottomLeftPot * bottomLeftScore + bottomRightPot * bottomRightScore) / totalScore;

    // gl_FragColor = vec4(topLeftScore / totalScore, topRightScore / totalScore, bottomLeftScore / totalScore, 1.);
    // gl_FragColor = vec4(vec3(topLeftScore), 1.);
    gl_FragColor = toBase256(interpolatedVal); //!why not right???, the bounds of each interpolated section are subtly off
}