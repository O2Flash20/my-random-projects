let raymarchingShader

function preload() {
    raymarchingShader = loadShader("raymarch.vert", "raymarch.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(1920, 1080, WEBGL)
    noStroke()
}

function draw() {
    background(220)
    raymarchingShader.setUniform("uResolution", [width, height])
    raymarchingShader.setUniform("uTime", frameCount)

    shader(raymarchingShader)

    rect(0, 0, width, height)
}
