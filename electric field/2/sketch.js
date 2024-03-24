let potentialShader, upscalePotentialShader, potentialVisShader, equipotentialsShader, fieldShader, upscaleFieldShader, fieldVisShader, chargeOutlineShader
function preload() {
    potentialShader = loadShader("basic.vert", "potential.frag")
    upscalePotentialShader = loadShader("basic.vert", "upscalePotential.frag")
    potentialVisShader = loadShader("basic.vert", "potentialVis.frag")
    equipotentialsShader = loadShader("basic.vert", "equipotentials.frag")

    fieldShader = loadShader("basic.vert", "field.frag")
    upscaleFieldShader = loadShader("basic.vert", "upscaleField.frag")
    fieldVisShader = loadShader("basic.vert", "fieldVis.frag")

    chargeOutlineShader = loadShader("basic.vert", "chargeOutline.frag")
}

let mode = "positive"
let chargeStrength = 1

const downScaleDivisor = 10

let cDraw, cPotential, cUpscalePotential, cPotentialVis, cEquipotentials, cField, cUpscaleField, cFieldVis, cFieldLines, cParticles, cChargeOutline, cComposite = null
let chargeSlider
let animateEquipotentials
function setup() {
    cDraw = createCanvas(800, 800)
    cDraw.elt.style = "display:none;"
    cDraw.elt.setAttribute("willReadFrequently", "true")
    strokeWeight(20)
    noSmooth()

    cPotential = createGraphics(width / downScaleDivisor, height / downScaleDivisor, WEBGL)
    cUpscalePotential = createGraphics(width, height, WEBGL)
    cPotentialVis = createGraphics(width, height, WEBGL)
    cEquipotentials = createGraphics(width, height, WEBGL)

    cField = createGraphics(width / downScaleDivisor, height / downScaleDivisor, WEBGL)
    cUpscaleField = createGraphics(width, height, WEBGL)
    cUpscaleField.elt.setAttribute("willReadFrequently", "true")
    cFieldVis = createGraphics(width, height, WEBGL)
    cFieldLines = createGraphics(width, height)
    cFieldLines.background(0)
    cFieldLines.stroke(255, 255, 0)
    cFieldLines.strokeWeight(2)
    cFieldLines.noFill()

    cParticles = createGraphics(width, height)
    cParticles.noStroke()

    cChargeOutline = createGraphics(width, height, WEBGL)

    cComposite = createGraphics(width, height)
    cComposite.elt.style = "display:block;"

    createP()
    chargeSlider = createSlider(-1, 1, 1, 0.1)
    animateEquipotentials = createCheckbox("Toggle Animated Equipotentials", true)
}

let lastMouseX, lastMouseY = null
let t = 0
function draw() {
    // update drawing charge if needed
    const sliderValue = chargeSlider.value()
    if (sliderValue < 0) {
        mode = "negative"
    }
    else if (sliderValue > 0) {
        mode = "positive"
    }
    else if (sliderValue == 0) {
        mode = "erase"
    }
    chargeStrength = Math.abs(sliderValue)

    t += deltaTime / 1000

    if (mouseIsPressed) {
        if (mode == "positive") {
            noErase()
            stroke(chargeStrength * 255, 0, 0)
        }
        else if (mode == "negative") {
            noErase()
            stroke(0, 0, chargeStrength * 255)
        }
        else if (mode == "erase") {
            erase()
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
    upscalePotentialShader.setUniform("uOriginalRes", [width / downScaleDivisor, height / downScaleDivisor])
    cUpscalePotential.shader(upscalePotentialShader)
    cUpscalePotential.rect(0, 0, 1, 1)

    potentialVisShader.setUniform("uPotential", cUpscalePotential)
    cPotentialVis.shader(potentialVisShader)
    cPotentialVis.rect(0, 0, 1, 1)

    equipotentialsShader.setUniform("uPotential", cUpscalePotential)
    equipotentialsShader.setUniform("uRes", [width, height])
    if (animateEquipotentials.checked()) {
        equipotentialsShader.setUniform("uTime", t / 2)
    }
    else {
        equipotentialsShader.setUniform("uTime", 0)
    }
    equipotentialsShader.setUniform("uShouldAnimateEquipotentials", true)
    cEquipotentials.shader(equipotentialsShader)
    cEquipotentials.rect(0, 0, 1, 1)

    cField.clear()
    fieldShader.setUniform("uWorld", cDraw)
    fieldShader.setUniform("uRes", [width, height])
    cField.shader(fieldShader)
    cField.rect(0, 0, 1, 1)

    cUpscaleField.clear()
    upscaleFieldShader.setUniform("uField", cField)
    upscaleFieldShader.setUniform("uOriginalRes", [width / downScaleDivisor, height / downScaleDivisor])
    cUpscaleField.shader(upscaleFieldShader)
    cUpscaleField.rect(0, 0, 1, 1)

    cFieldVis.clear()
    fieldVisShader.setUniform("uField", cUpscaleField)
    fieldVisShader.setUniform("uTime", t)
    cFieldVis.shader(fieldVisShader)
    cFieldVis.rect(0, 0, 1, 1)

    chargeOutlineShader.setUniform("uCharges", cDraw)
    chargeOutlineShader.setUniform("uRes", [width, height])
    cChargeOutline.shader(chargeOutlineShader)
    cChargeOutline.rect(0, 0, 1, 1)

    cComposite.blendMode(BLEND)
    cComposite.background(0)

    cComposite.blendMode(SCREEN)
    // when upscaling with my method, images are essentially shrunk a bit, so I have to size them up again
    cComposite.image(cEquipotentials, 0, 0, width + downScaleDivisor, height + downScaleDivisor)
    cComposite.image(cFieldLines, 0, 0, width + downScaleDivisor, height + downScaleDivisor)

    cComposite.tint(25)
    cComposite.image(cPotentialVis, 0, 0, width + downScaleDivisor, height + downScaleDivisor)
    cComposite.noTint()

    cComposite.image(cChargeOutline, 0, 0)

    cComposite.blendMode(BLEND)
    cComposite.image(cDraw, 0, 0)

    cParticles.clear()
    cUpscaleField.loadPixels()
    for (let e of emitters) {
        if (frameCount % 30 == 0) { e.emit() }
        e.update(deltaTime / 1000)
        e.applyElectricForce()
        e.draw(cParticles)
    }

    cComposite.image(cParticles, 0, 0)
}

let emitters = []
function keyTyped() {
    if (key == "1") {
        chargeSlider.elt.value = "1"
    }
    else if (key == "2") {
        chargeSlider.elt.value = "-1"
    }
    else if (key == "3") {
        chargeSlider.elt.value = "0"
    }
    else if (key == "f") { // draw a field line
        cUpscaleField.loadPixels()
        loadPixels()
        let lineTracer = createVector(mouseX, mouseY)
        // in the direction of the field
        cFieldLines.beginShape()
        for (let k = 0; k < 1000; k++) {
            if (lineTracer.x < 0 || lineTracer.x > width || lineTracer.y < 0 || lineTracer.y > height) {
                break
            }
            cFieldLines.vertex(
                lineTracer.x,
                lineTracer.y
            )
            const pixelX = Math.floor(lineTracer.x)
            const pixelY = Math.floor(lineTracer.y)
            if (pixels[(pixelX + pixelY * width) * 4 + 3] != 0) {
                break
            }
            lineTracer.add(p5.Vector.fromAngle(cUpscaleField.pixels[(pixelX + pixelY * width) * 4] / 255 * 2 * Math.PI - Math.PI / 2).mult(4))
        }
        cFieldLines.endShape()

        // against the direction of the field
        lineTracer = createVector(mouseX, mouseY)
        cFieldLines.beginShape()
        for (let k = 0; k < 1000; k++) {
            if (lineTracer.x < 0 || lineTracer.x > width || lineTracer.y < 0 || lineTracer.y > height) {
                break
            }
            cFieldLines.vertex(
                lineTracer.x,
                lineTracer.y
            )
            const pixelX = Math.floor(lineTracer.x)
            const pixelY = Math.floor(lineTracer.y)
            if (pixels[(pixelX + pixelY * width) * 4 + 3] != 0) {
                break
            }
            lineTracer.add(p5.Vector.fromAngle(cUpscaleField.pixels[(pixelX + pixelY * width) * 4] / 255 * 2 * Math.PI - Math.PI / 2).mult(-4))
        }
        cFieldLines.endShape()

        // draw the arrow showing the direction of the field
        const angleAtClick = cUpscaleField.pixels[(mouseX + mouseY * width) * 4] / 255 * 2 * Math.PI - Math.PI / 2
        cFieldLines.push()
        cFieldLines.translate(mouseX, mouseY)
        cFieldLines.rotate(angleAtClick)
        cFieldLines.line(-10, 10, 0, 0)
        cFieldLines.line(-10, -10, 0, 0)
        cFieldLines.pop()
    }
    else if (key == "e") { //add a particle emitter
        let emitterCharge
        if (mode == "positive") { emitterCharge = chargeStrength }
        else if (mode == "negative") { emitterCharge = -chargeStrength }
        else { return } //watch out for this return future me!
        emitters.push(new Emitter(createVector(mouseX, mouseY), emitterCharge, 800, 10))
    }
}

function mousePressed() {
    if (mouseX < width && mouseY < height) {
        cFieldLines.background(0)
    }
}

/*
Note: The most efficient way to save the data would be to treat all 4 colour channels as 32 bits total and use only one bit for the sign, instead of using 2 colour channels for positive and 2 for negative. But numbers from here will never go that high and more precision is not necessary.

TODO: ability to delete emitters, change the look of particles, visualizer for the color you picked
remove visualizations when done
*/