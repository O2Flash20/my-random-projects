let bloomShader
let c
let m

const width = 400
const height = 400

function preload() {
    bloomShader = loadShader("bloom.vert", "bloom.frag")

    c = createGraphics(width, height)
    m = createGraphics(width, height)

    c.noStroke()
    m.noStroke()
}

function setup() {
    createCanvas(width, height, WEBGL)
}

function draw() {
    background(220)

    glowRect(color(255, 255, 0), 255, 10, 10, 50, 50)
    glowRect(color(0, 255, 0), 255, 20, 20, 50, 50)

    bloomShader.setUniform("uTex", c)
    bloomShader.setUniform("uMask", m)
    bloomShader.setUniform("uRes", [width, height])
    shader(bloomShader)
    rect(1, 1, 1, 1)
}

function glowRect(col, brightness, x, y, width, height) {
    c.fill(col)
    c.rect(x, y, width, height)
    m.fill(brightness)
    m.rect(x, y, width, height)
}