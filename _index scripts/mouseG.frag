#ifdef GL_ES
precision mediump float;
#endif

// get it from the vertex shader
varying vec2 vTexCoord;

uniform vec2 uRes;
uniform vec2 uCanvasPos;
uniform vec2 uMousePos;
uniform float uTime;

float hash(vec3 p) {
    p = fract(p * 0.3183099 + .1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbmNoise(vec3 x) {
    return (0.5 * noise(x / 8.) + 0.25 * noise(x / 4.) + 0.125 * noise(x / 2.) + 0.0625 * noise(x));
}

float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return (outMax - outMin) * (value - inMin) / (inMax - inMin) + outMin;
}

vec3 colorRamp(float value, float inMin, float inMax, vec3 color1, vec3 color2) {
    return (color2 - color1) * (value - inMin) / (inMax - inMin) + color1;
}

void main() {
    vec2 uv = vTexCoord;

    // "the texture is loaded upside down and backwards by default so lets flip it"
    uv.y = 1.0 - uv.y;

    vec2 mouseUV = vec2((uMousePos - uCanvasPos) / uRes);

    vec2 displacedUV = uv + mapRange(fbmNoise(vec3(uv * 20., uTime / 20.)), 0., 1., -0.1, 0.1);
    float val = distance(mouseUV * uRes, displacedUV * uRes);

    float colorValue = (sin(val / length(uRes) * 20. - uTime / 20.) + 1.) / 2.;
    colorValue = floor(colorValue * 7.) / 7.;
    vec3 col = colorRamp(colorValue, 0., 1., vec3(0.0, 0.68, 0.77), vec3(0.11, 0.97, 0.0));
    gl_FragColor = vec4(col, 1.);
}