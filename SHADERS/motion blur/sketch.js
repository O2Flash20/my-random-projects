let motionDetectShader
let oldInput

// canvas to do things on
let c
let cam

let oldFrames = []

let frameGap = 7

function preload() {
    c = createGraphics(400, 400, WEBGL)
    motionDetectShader = loadShader("motionDetect.vert", "motionDetect.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(400, 400, WEBGL)
    noStroke()

    frameRate(144)

    oldInput = createGraphics(400, 400)

    cam = createCapture(VIDEO)
    cam.size(windowWidth, windowHeight)
    cam.hide()

    c.fill(255)
    c.noStroke()
}

let pos = 10
function draw() {
    // c.background(51)
    // pos++
    // c.rect(pos, 100, 10, 10)
    c.image(cam, -c.width / 2, -c.height / 2, c.width, c.height)

    motionDetectShader.setUniform("uRes", [width, height])
    motionDetectShader.setUniform("uInput", c)
    motionDetectShader.setUniform("uOldInput", oldInput)
    shader(motionDetectShader)
    rect(0, 0, width, height)

    // make a new frame
    oldFrames.push(c.get())

    // delete old frames
    if (oldFrames.length > frameGap) {
        oldFrames.splice(0, 1)
    }

    oldInput.image(oldFrames[0], 0, 0, 400, 400)
}
