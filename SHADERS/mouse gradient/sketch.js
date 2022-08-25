let mouseGShader
let c

function preload() {
    mouseGShader = loadShader("mouseG.vert", "mouseG.frag")
}

function setup() {
    c = createCanvas(400, 1080, WEBGL)
}

function draw() {
    background(220)

    mouseGShader.setUniform("uRes", [width, height])
    mouseGShader.setUniform("uCanvasPos", [c.position().x, c.position().y])
    mouseGShader.setUniform("uMousePos", [mouseX, mouseY])

    shader(mouseGShader)
    rect(0, 0, width, height)
}