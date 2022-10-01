let raymarchShader
let sky

function preload() {
    raymarchShader = loadShader("raymarch.vert", "raymarch.frag")

    sky = loadImage("sky.jpg")
}

function setup() {
    createCanvas(1920, 1080, WEBGL)
}

function draw() {
    background(220)

    raymarchShader.setUniform("uRes", [width, height])
    raymarchShader.setUniform("uTime", frameCount / 100)
    raymarchShader.setUniform("uSkyTex", sky)

    shader(raymarchShader)
    rect(1, 1, 1, 1)
}
