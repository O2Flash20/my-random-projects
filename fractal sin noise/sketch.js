let noiseShader
function preload() {
    noiseShader = loadShader("basic.vert", "fsn.frag")
}

function setup() {
    createCanvas(400, 400, WEBGL)
}

let t = 0
function draw() {
    background(220)

    t += deltaTime / 1000
    noiseShader.setUniform("uTime", t)

    shader(noiseShader)
    rect(1, 1, 1, 1)
}
