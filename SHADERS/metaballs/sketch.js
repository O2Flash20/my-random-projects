let metaballsShader

function preload() {
    metaballsShader = loadShader("metaballs.vert", "metaballs.frag")
}

function setup() {
    createCanvas(700, 700, WEBGL)
}

function draw() {
    background(220)

    metaballsShader.setUniform("uPos", [mouseX, mouseY])
    metaballsShader.setUniform("uRes", [width, height])

    shader(metaballsShader)
    rect(1, 1, 1, 1)
}
