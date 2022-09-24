let raymarchShader

function preload() {
    raymarchShader = loadShader("raymarch.vert", "raymarch.frag")
}

function setup() {
    createCanvas(1920, 1080, WEBGL)
}

function draw() {
    background(220)

    raymarchShader.setUniform("uRes", [width, height])
    raymarchShader.setUniform("uTime", frameCount / 100)

    shader(raymarchShader)
    rect(1, 1, 1, 1)
}
