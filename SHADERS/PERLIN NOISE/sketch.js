let noiseShader

function preload() {
    noiseShader = loadShader("noise.vert", "noise.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(400, 400, WEBGL)
}

function draw() {
    noiseShader.setUniform("iResolution", [width, height])
    noiseShader.setUniform("iTime", frameCount)

    shader(noiseShader)
    rect(0, 0, width, height)
}
