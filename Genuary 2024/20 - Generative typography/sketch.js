let mask
let edgeShader
let noiseShader
let colorShader
function preload() {
    mask = loadImage("mask.png")
    edgeShader = loadShader("basic.vert", "edges.frag")
    noiseShader = loadShader("basic.vert", "smoothNoise.frag")
    colorShader = loadShader("basic.vert", "colorize.frag")
}

let c1
let c2
let c3
function setup() {
    pixelDensity(1)

    createCanvas(800, 600, WEBGL)
    createP("^A blurred and colored version of the image is added to a dilated version of the image to give a neon effect.^")

    c3 = createGraphics(width, height, WEBGL) //holds the edge detected version
    createP("^Posterized and edge-detected^")

    c1 = createGraphics(width, height) //holds the text
    c1.noStroke()
    c1.fill(255)
    c1.textSize(90)
    c1.textAlign(CENTER)
    createP("^User's text is written, blurred, and used as a mask for the noise texture^")

    c2 = createGraphics(width, height, WEBGL) //holds the noise texture
    createP("^A smooth noise texture^")
}

let t = 0
function draw() {
    t += deltaTime / 1000

    c1.blendMode(BLEND)
    c1.background(0)
    c1.text(document.getElementById("textInput").value, width / 2 - 400, 40, 800)
    c1.filter(BLUR, 4)
    c1.blendMode(MULTIPLY)

    noiseShader.setUniform("uSeed", 2)
    noiseShader.setUniform("uDetail", 20)
    noiseShader.setUniform("uOffset", [t / 30, t / 40])
    c2.shader(noiseShader)
    c2.rect(0, 0, width, height)

    c1.image(c2, 0, 0, width, height)

    edgeShader.setUniform("uRes", [width, height])
    edgeShader.setUniform("uTex", c1)
    c3.shader(edgeShader)
    c3.rect(0, 0, width, height)

    colorShader.setUniform("uTex", c3)
    colorShader.setUniform("uRes", [width, height])
    shader(colorShader)
    rect(0, 0, width, height)
}
