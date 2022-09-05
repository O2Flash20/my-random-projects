let lightShader
let c
let blurShader

let dust

function preload() {
    lightShader = loadShader("light.vert", "light.frag")
    c = createGraphics(800, 800, WEBGL)

    blurShader = loadShader("blur.vert", "blur.frag")

    dust = loadImage("dust in air.png")
}

let lights = [10, 160, 600]
let light1Col = [169, 0, 255]
let light2Col = [255, 0, 0]
let light3Col = [0, 255, 255]

// let light1Col = [169, 169, 169]
// let light2Col = [10, 10, 10]
// let light3Col = [255, 255, 255]

// let light1Col = [0, 70, 255]
// let light2Col = [0, 10, 200]
// let light3Col = [0, 255, 255]


function setup() {
    createCanvas(800, 800, WEBGL)
}

function draw() {
    c.background(220)

    lights[0] += map(noise(frameCount / 400 + 1000), 0, 1, -5, 5)
    lights[1] += map(noise(frameCount / 400), 0, 1, -5, 5)
    lights[2] += map(noise(frameCount / 400 - 1000), 0, 1, -5, 5)

    for (let i = 0; i < 3; i++) {
        if (lights[i] < 0) { lights[i] = 800 }
        if (lights[i] > 800) { lights[i] = 0 }
    }

    lightShader.setUniform("uLights", lights)
    lightShader.setUniform("uLight1", light1Col)
    lightShader.setUniform("uLight2", light2Col)
    lightShader.setUniform("uLight3", light3Col)
    lightShader.setUniform("uRes", [width, height])
    lightShader.setUniform("uDustMap", dust)

    c.shader(lightShader)
    c.rect(0, 0, 400, 800)

    blurShader.setUniform("uTex", c)
    blurShader.setUniform("uRes", [width, height])

    shader(blurShader)
    rect(0, 0, 10, 10)

    // image(c, -400, -400, 800, 800)
}

// image for light layer
// image for ceiling layer
// image for floor layer (output)