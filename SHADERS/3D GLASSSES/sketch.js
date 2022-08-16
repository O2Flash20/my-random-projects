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
            color: loadImage("assets/sphereC.png"),
            depth: loadImage("assets/sphereD.png")
        },
        scene1: {
            color: loadImage("assets/scene1C.png"),
            depth: loadImage("assets/scene1D.png")
        },
        scene2: {
            color: loadImage("assets/scene2C.png"),
            depth: loadImage("assets/scene2D.png")
        },
        flowers: {
            color: loadImage("assets/flowersC.png"),
            depth: loadImage("assets/flowersD.png")
        },
        game: {
            color: loadImage("assets/gameC.png"),
            depth: loadImage("assets/gameD.png")
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



    img(textures.scene2, 0, 0, width, height)

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

/*
NOTES

additional shader to turn the image into cyan/red
*/