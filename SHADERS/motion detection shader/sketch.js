let motionDetectShader
let input
let oldInput

let oldFrames = []

let frameGap = 7

function preload() {
    motionDetectShader = loadShader("motionDetect.vert", "motionDetect.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(windowWidth, windowHeight, WEBGL)
    noStroke()

    frameRate(144)

    input = createCapture(VIDEO)
    input.size(windowWidth, windowHeight)
    input.hide()

    oldInput = createGraphics(windowWidth, windowHeight)
}

function draw() {
    motionDetectShader.setUniform("uInput", input)
    motionDetectShader.setUniform("uOldInput", oldInput)

    shader(motionDetectShader)
    rect(0, 0, width, height)


    // make a new frame
    oldFrames.push(input.get())

    // delete old frames
    if (oldFrames.length > frameGap) {
        oldFrames.splice(0, 1)
    }

    oldInput.image(oldFrames[0], 0, 0, windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}
