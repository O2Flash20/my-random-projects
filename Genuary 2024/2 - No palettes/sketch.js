let img
let paletteShader
function preload() {
    img = loadImage("image.png")
    paletteShader = loadShader("basic.vert", "paletting.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(480, 270, WEBGL)
}

function draw() {
    background(220)
    // image(img, 0, 0, 480, 270)

    paletteShader.setUniform("uImg", img)

    let v1 = random()
    let v2 = random()
    paletteShader.setUniform("uHMin", v1)
    paletteShader.setUniform("uHMax", v2)

    while (Math.abs(v1 - v2) > 0.3) {
        v1 = random()
        v2 = random()
    }
    paletteShader.setUniform("uSMin", min(v1, v2))
    paletteShader.setUniform("uSMax", max(v1, v2))

    while (Math.abs(v1 - v2) < 0.3) {
        v1 = random()
        v2 = random()
    }
    paletteShader.setUniform("uLMin", min(v1, v2))
    paletteShader.setUniform("uLMax", max(v1, v2))

    shader(paletteShader)
    rect(0, 0, width, height)

    frameRate(1.5)
}
