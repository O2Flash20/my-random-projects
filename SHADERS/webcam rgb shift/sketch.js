let rgbShiftShader
let cam

function preload() {
    rgbShiftShader = loadShader("webcam.vert", "webcam.frag")
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
    shader(rgbShiftShader)

    // pass in the MediaElement as a texture to the shader
    rgbShiftShader.setUniform('tex0', cam)
    rgbShiftShader.setUniform("uTime", frameCount)

    rect(0, 0, width, height)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}
