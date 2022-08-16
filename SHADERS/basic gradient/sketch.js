let theShader

function preload() {
    theShader = loadShader("gradient.vert", "gradient.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(400, 400, WEBGL)
    noStroke()
}

function draw() {
    background(220)
    theShader.setUniform("uResolution", [width, height])

    shader(theShader)

    rect(0, 0, width, height)
}
