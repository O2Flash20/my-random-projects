let threeDShader
let colorLayer
let depthLayer

let cyanRedShader

let textures

function preload() {
    threeDShader = loadShader("3d.vert", "3d.frag")
    cyanRedShader = loadShader("cyanRed.vert", "cyanRed.frag")

    textures = {
        sphere: {
            color: loadImage("assets/goobaC.png"),
            depth: loadImage("assets/goobaD.png")
        },
        scene1: {
            color: loadImage("assets/goobaC.png"),
            depth: loadImage("assets/goobaD.png")
        },
        scene2: {
            color: loadImage("assets/goobaC.png"),
            depth: loadImage("assets/goobaD.png")
        },
        flowers: {
            color: loadImage("assets/goobaC.png"),
            depth: loadImage("assets/goobaD.png")
        },
        game: {
            color: loadImage("assets/goobaC.png"),
            depth: loadImage("assets/goobaD.png")
        }
    }
}

const width = 400
const height = 400
function setup() {
    createCanvas(width * 2, height, WEBGL)
    noStroke()

    colorLayer = createGraphics(width, height)
    depthLayer = createGraphics(width, height)
}

function draw() {
    translate(-width / 2, -height / 2)

    threeDShader.setUniform("uColorLayer", colorLayer)
    threeDShader.setUniform("uDepthLayer", depthLayer)
    threeDShader.setUniform("uResolution", [width, height])



    img(textures.flowers, 0, 0, width, height)

    shader(threeDShader)
    rect(0, 0, width, height)

    // cyanRedShader.setUniform("uCanvas", get())
    // shader(cyanRedShader)
    // rect(0, 0, width, height)

    // image(textures.scene2.depth, -width / 2, 0, width, height)
}

// ex. img(textures.sphere)
function img(image, x, y, w, h) {
    colorLayer.image(image.color, x, y, w, h)
    depthLayer.image(image.depth, x, y, w, h)
}