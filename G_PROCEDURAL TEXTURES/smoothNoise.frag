// Strongly based off of:

// https://www.shadertoy.com/view/4dlGW2
// Tileable noise, for creating useful textures. By David Hoskins, Sept. 2013.

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

float Hash(in vec2 p, in float scale) {
	// This is tiling part, adjusts with the scale...
    p = mod(p, scale);
    return fract(sin(dot(p, vec2(27.16898, 38.90563))) * 5151.5473453);
}

float Noise(in vec2 p, in float scale) {
    vec2 f;

    p *= scale;

    f = fract(p);		// Separate integer from fractional
    p = floor(p);

    f = f * f * (3.0 - 2.0 * f);	// Cosine interpolation approximation

    float res = mix(mix(Hash(p, scale), Hash(p + vec2(1.0, 0.0), scale), f.x), mix(Hash(p + vec2(0.0, 1.0), scale), Hash(p + vec2(1.0, 1.0), scale), f.x), f.y);
    return res;
}

float fBm(in vec2 p) {
    float f = 0.0;
	// Change starting scale to any integer value...
    float scale = 20.;
    p = mod(p, scale);
    float amp = 0.6;

    for (int i = 0; i < 5; i++) {
        f += Noise(p, scale) * amp;
        amp *= .5;
		// Scale must be multiplied by an integer value...
        scale *= 2.;
    }
	// Clamp it just in case....
    return min(f, 1.0);
}

//----------------------------------------------------------------------------------------
void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

	// Do the noise cloud (fractal Brownian motion)
    float value = fBm(uv);

    value = pow(value, 1.2); // contrast control ig
    vec3 col = vec3(value);

    gl_FragColor = vec4(col, 1.0);
}

/*
*CONTROLS (ADD LATER)
scale (detail), contrast, amplitude
*/