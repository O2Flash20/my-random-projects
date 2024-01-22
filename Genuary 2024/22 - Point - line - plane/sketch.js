let dilateShader

function preload() {
    dilateShader = loadShader("basic.vert", "dilate.frag")
}

let c
let oc
function setup() {
    oc = createCanvas(600, 600) //"original canvas"

    c = createGraphics(width, height, WEBGL)

    noStroke()

    background(0)

    colorMode(HSL)
}

t = 0
animationLength = 6
function draw() {
    background(187, 60, 5)
    t += deltaTime / 1000

    let pos = createVector(width / 2, height / 2)
    let scale = 400

    drawPLPInstance(pos, scale, t, animationLength)

    // dilate the image, or else the point and line will only be one pixel wide. this rounds them
    dilateShader.setUniform("uRes", [width, height])
    dilateShader.setUniform("uTex", oc)
    c.shader(dilateShader)
    c.rect(0, 0, width, height)

    image(c, 0, 0, width, height)
}

function drawPLPInstance(pos, scale, t, tMax) {
    const pointCol = [305, 100, 42]
    const lineCol = [305, 50, 44]
    const planeCol = [305, 35, 29]

    t = t % tMax
    if (t <= tMax / 3) {
        const subT = t / (tMax / 3)
        const mixAmt = easeInOutQuart(subT)
        fill(
            pointCol[0] * (1 - mixAmt) + lineCol[0] * mixAmt,
            pointCol[1] * (1 - mixAmt) + lineCol[1] * mixAmt,
            pointCol[2] * (1 - mixAmt) + lineCol[2] * mixAmt,
        )
        rect(pos.x - (scale / 2) * mixAmt, pos.y, scale * mixAmt + 1, 1)
    }
    if (t - (tMax / 3) <= tMax / 3 && t - (tMax / 3) > 0) {
        const subT = (t - tMax / 3) / (tMax / 3)
        const mixAmt = easeInOutQuart(subT)
        fill(
            lineCol[0] * (1 - mixAmt) + planeCol[0] * mixAmt,
            lineCol[1] * (1 - mixAmt) + planeCol[1] * mixAmt,
            lineCol[2] * (1 - mixAmt) + planeCol[2] * mixAmt,
        )
        rect(pos.x - (scale / 2), pos.y - (scale / 2) * mixAmt, scale, scale * mixAmt + 1)
    }
    if (t - (tMax / 1.5) <= tMax / 3 && t - (tMax / 1.5) > 0) {
        const subT = (t - tMax / 1.5) / (tMax / 3)
        const mixAmt = easeInOutQuart(subT)
        fill(
            planeCol[0] * (1 - mixAmt) + pointCol[0] * mixAmt,
            planeCol[1] * (1 - mixAmt) + pointCol[1] * mixAmt,
            planeCol[2] * (1 - mixAmt) + pointCol[2] * mixAmt,
        )
        rect(pos.x - (scale / 2) * (1 - mixAmt), pos.y - (scale / 2) * (1 - mixAmt), scale * (1 - mixAmt) + 1, scale * (1 - mixAmt) + 1)
    }
}

// from https://easings.net/
function easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}