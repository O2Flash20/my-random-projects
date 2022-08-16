let edgeDetectShader
let cam

function preload() {
    edgeDetectShader = loadShader("edgeDetect.vert", "edgeDetect.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(windowWidth, windowHeight, WEBGL)
    noStroke()

    cam = createCapture(VIDEO)
    cam.size(windowWidth, windowHeight)

    cam.hide()
}

function draw() {
    shader(edgeDetectShader)

    edgeDetectShader.setUniform('tex0', cam)
    edgeDetectShader.setUniform("uResolution", [width, height])

    rect(0, 0, width, height)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}
