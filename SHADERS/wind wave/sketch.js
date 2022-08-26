let waveShader
let img

let freq = 8
let amp = 0.2

function preload() {
    waveShader = loadShader("wave.vert", "wave.frag")
    img = loadImage("canadaFlag.jpg")
}

function setup() {
    createCanvas(800, 800, WEBGL)
}

function draw() {
    background(220)

    waveShader.setUniform("uTex", img)
    waveShader.setUniform("uFrequency", freq)
    waveShader.setUniform("uAmplitude", amp)
    waveShader.setUniform("uOffset", frameCount / 300)

    shader(waveShader)
    rect(0, 0, 0, 0)
}
