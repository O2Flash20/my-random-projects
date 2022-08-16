#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uTile;
uniform vec2 uNumTiles;

void main() {
    vec2 uv = vTexCoord;

    uv.y = 1.0 - uv.y;

    float uvx = uv.x * uNumTiles.x - floor(uv.x * uNumTiles.x);
    float uvy = uv.y * uNumTiles.y - floor(uv.y * uNumTiles.y);

    vec4 col = texture2D(uTile, vec2(uvx, uvy));

    gl_FragColor = col;
}