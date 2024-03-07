let potentialShader, upscalePotentialShader, potentialVisShader
function preload() {
    potentialShader = loadShader("basic.vert", "potential.frag")
    upscalePotentialShader = loadShader("basic.vert", "upscalePotential.frag")
    potentialVisShader = loadShader("basic.vert", "potentialVis.frag")
}

let mode = "positive"
let chargeStrength = 1

const downScaleDivisor = 10

let cDraw, cPotential, cUpscalePotential, cPotentialVis = null
function setup() {
    cDraw = createCanvas(800, 800)
    background(0)
    strokeWeight(20)
    noSmooth()

    cPotential = createGraphics(width / downScaleDivisor, height / downScaleDivisor, WEBGL)
    // cPotential.elt.style = "width:800px;1height:800px"

    cUpscalePotential = createGraphics(width, height, WEBGL)

    cPotentialVis = createGraphics(width, height, WEBGL)
}

let lastMouseX, lastMouseY = null
let t = 0 //remove later
function draw() {
    t += deltaTime//remove later

    if (mouseIsPressed) {
        if (mode == "positive") {
            stroke(chargeStrength * 255, 0, 0)
        }
        else if (mode == "negative") {
            stroke(0, 0, chargeStrength * 255)
        }
        else if (mode == "erase") {
            stroke(0)
        }
        line(lastMouseX, lastMouseY, mouseX, mouseY)
    }

    lastMouseX = mouseX
    lastMouseY = mouseY

    cPotential.clear()
    potentialShader.setUniform("uWorld", cDraw)
    potentialShader.setUniform("uRes", [width, height])
    cPotential.shader(potentialShader)
    cPotential.rect(0, 0, 1, 1)

    cUpscalePotential.clear()
    upscalePotentialShader.setUniform("uPotential", cPotential)
    upscalePotentialShader.setUniform("uRes", [width, height])
    upscalePotentialShader.setUniform("uOriginalRes", [width / downScaleDivisor, height / downScaleDivisor])
    upscalePotentialShader.setUniform("uTime", t)
    cUpscalePotential.shader(upscalePotentialShader)
    cUpscalePotential.rect(0, 0, 1, 1)

    cPotentialVis.clear()
    potentialVisShader.setUniform("uPotential", cUpscalePotential)
    cPotentialVis.shader(potentialVisShader)
    cPotentialVis.rect(0, 0, 1, 1)
}

function keyTyped() {
    if (key == "1") {
        mode = "positive"
    }
    else if (key == "2") {
        mode = "negative"
    }
    else if (key == "3") {
        mode = "erase"
    }
}