#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uColorLayer;
uniform sampler2D uDepthLayer;
uniform vec2 uResolution;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    const int separationMax = 17;
    float depth = texture2D(uDepthLayer, uv).r * float(separationMax);
    vec4 col = vec4(uv.x, uv.y, 1., 1.);
    float pixelIncrement = 1. / uResolution.x;

    if(uv.x < 0.5) {
        // left side (right eye) (things shifted left)

        // from this pixel to the one at separationMax, give each a score depending on how close its shift is to the current pixel
        int scores[separationMax];
        for(int i = 0; i < separationMax; i++) {
            // get the red value of the next pixel over (how many pixels over depending on i)
            int targetDepth = int(texture2D(uDepthLayer, vec2((uv.x * 2.) + pixelIncrement * float(i), uv.y)).r * float(separationMax));
            scores[i] = i - targetDepth;
        }

        // find the lowest (best) score of all
        int lowestScore = 9999;
        for(int i = 0; i < separationMax; i++) {
            if(scores[i] < lowestScore && scores[i] > -1) {
                lowestScore = scores[i];
            }
        }

        // find the offset of the pixel with the best score
        int offsetOftarget = 0;
        for(int i = separationMax - 1; i >= 0; i--) {
            if(scores[i] == lowestScore) {
                offsetOftarget = i;
            }
        }

        // output that pixel
        col = texture2D(uColorLayer, vec2((uv.x * 2.) + pixelIncrement * float(offsetOftarget), uv.y));
        // col = texture2D(uColorLayer, vec2(uv.x * 2., uv.y));
    } else {
        // right side (left eye) (things shifted right)

        // from this pixel to the one at separationMax, give each a score depending on how close its shift is to the current pixel
        int scores[separationMax];
        for(int i = 0; i < separationMax; i++) {
            // get the red value of the next pixel over (how many pixels over depending on i)
            int targetDepth = int(texture2D(uDepthLayer, vec2((uv.x * 2.) - pixelIncrement * float(i), uv.y)).r * float(separationMax));
            scores[i] = i - targetDepth;
        }

        // find the lowest (best) score of all
        int lowestScore = 9999;
        for(int i = 0; i < separationMax; i++) {
            if(scores[i] < lowestScore && scores[i] > -1) {
                lowestScore = scores[i];
            }
        }

        // find the offset of the pixel with the best score
        int offsetOftarget = 0;
        for(int i = separationMax - 1; i >= 0; i--) {
            if(scores[i] == lowestScore) {
                offsetOftarget = i;
            }
        }

        // output that pixel
        col = texture2D(uColorLayer, vec2(((uv.x - 0.5) * 2.) - pixelIncrement * float(offsetOftarget), uv.y));
        // col = texture2D(uColorLayer, vec2(uv.x * 2., uv.y));
    }

    gl_FragColor = col;
}