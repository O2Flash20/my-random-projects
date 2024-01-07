let styleShader
function preload() {
    styleShader = loadShader("basic.vert", "style.frag")
}

let c
let noiseTexture

function setup() {
    createCanvas(500, 380, WEBGL)

    c = createGraphics(500, 380)
    c.rectMode(CENTER)
    c.noFill()
    c.strokeWeight(0.5)

    noiseTexture = createImage(500, 380)
}

let t = 0
function draw() {
    c.background(255)
    t += deltaTime / 1000

    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            const xOffset = (2 * noise(x * 10, t / 2, y * 10) - 1) * 5
            const yOffset = (2 * noise(y * 10, t / 2, x * 10) - 1) * 5
            c.rect(x * 48 + 35 + xOffset, y * 34 + 35 + yOffset, 35, 35)
        }
    }

    noiseTexture.loadPixels()
    for (let x = 0; x < noiseTexture.width; x++) {
        for (let y = 0; y < noiseTexture.height; y++) {
            const thisIndex = x + y * noiseTexture.width
            const noiseVal = noise(x / 20, y / 20, 2 * t) * 255
            noiseTexture.pixels[thisIndex * 4 + 0] = noiseVal
            noiseTexture.pixels[thisIndex * 4 + 1] = noiseVal
            noiseTexture.pixels[thisIndex * 4 + 2] = 0
            noiseTexture.pixels[thisIndex * 4 + 3] = 255
        }
    }
    noiseTexture.updatePixels()

    styleShader.setUniform("uRes", [width, height])
    styleShader.setUniform("uTex", c)
    styleShader.setUniform("uDisplacement", noiseTexture)
    styleShader.setUniform("uTime", t)

    shader(styleShader)
    rect(0, 0, 1, 1)
}
