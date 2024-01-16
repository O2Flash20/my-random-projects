let img
let tileShader
function preload() {
    img = loadImage("guy.png")

    tileShader = loadShader("basic.vert", "tile.frag")
}

function setup() {
    createCanvas(1000, 1000, WEBGL)
    frameRate(300)
}

let t = 0
function draw() {
    background(51)

    t += deltaTime / 1000

    tileShader.setUniform("uTime", t)
    tileShader.setUniform("uImg", img)
    shader(tileShader)
    rect(0, 0, width, height)

    document.getElementById("fps").innerText = "Average frame rate: " + Math.floor(frameCount / t) + " fps"
}
