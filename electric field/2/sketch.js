let potentialShader, upscalePotentialShader, potentialVisShader, equipotentialsShader, fieldShader
function preload() {
    potentialShader = loadShader("basic.vert", "potential.frag")
    upscalePotentialShader = loadShader("basic.vert", "upscalePotential.frag")
    potentialVisShader = loadShader("basic.vert", "potentialVis.frag")
    equipotentialsShader = loadShader("basic.vert", "equipotentials.frag")
    fieldShader = loadShader("basic.vert", "field.frag")
}

let mode = "positive"
let chargeStrength = 1

const downScaleDivisor = 10

let cDraw, cPotential, cUpscalePotential, cPotentialVis, cEquipotentials, cField = null
function setup() {
    cDraw = createCanvas(800, 800)
    background(0)
    strokeWeight(20)
    noSmooth()

    cPotential = createGraphics(width / downScaleDivisor, height / downScaleDivisor, WEBGL)
    // cPotential.elt.style = "width:800px;1height:800px"
    cUpscalePotential = createGraphics(width, height, WEBGL)
    cPotentialVis = createGraphics(width, height, WEBGL)
    cEquipotentials = createGraphics(width, height, WEBGL)
    cField = createGraphics(width / downScaleDivisor, height / downScaleDivisor, WEBGL)
    cField.elt.style = "width:800px;1height:800px"
}

let lastMouseX, lastMouseY = null
let t = 0
function draw() {
    t += deltaTime / 1000

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
    cUpscalePotential.shader(upscalePotentialShader)
    cUpscalePotential.rect(0, 0, 1, 1)

    cPotentialVis.clear()
    potentialVisShader.setUniform("uPotential", cUpscalePotential)
    cPotentialVis.shader(potentialVisShader)
    cPotentialVis.rect(0, 0, 1, 1)

    equipotentialsShader.setUniform("uPotential", cUpscalePotential)
    equipotentialsShader.setUniform("uRes", [width, height])
    equipotentialsShader.setUniform("uTime", t)
    equipotentialsShader.setUniform("uShouldAnimateEquipotentials", true)
    cEquipotentials.shader(equipotentialsShader)
    cEquipotentials.rect(0, 0, 1, 1)

    cField.clear()
    fieldShader.setUniform("uWorld", cDraw)
    fieldShader.setUniform("uRes", [width, height])
    cField.shader(fieldShader)
    cField.rect(0, 0, 1, 1)
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

/*
Note: The most efficient way to save the data would be to treat all 4 colour channels as 32 bits total and use only one bit for the sign, instead of using 2 colour channels for positive and 2 for negative. But numbers from here will never go that high and more precision is not necessary.
*/