const w = 1000
const h = 1000

let shapePoints = []

// each has [m, b, x1, x2]
let lineRules = []

let maskBuffer
let maskShader

let distanceBuffer
let distanceShader

let sumBuffer
let sumShader

let points = [] //"shops"

function preload() {
    maskBuffer = createGraphics(w, h, WEBGL)
    maskShader = loadShader("basic.vert", "mask.frag")

    distanceBuffer = createGraphics(w, h, WEBGL)
    distanceShader = loadShader("basic.vert", "distance.frag")

    sumBuffer = createGraphics(w, 1, WEBGL) //only the columns
    sumShader = loadShader("basic.vert", "sum.frag")
}

let startButton
function setup() {
    pixelDensity(1)
    createCanvas(w, h)

    maskBuffer.shader(maskShader)
    distanceBuffer.shader(distanceShader)
    sumBuffer.shader(sumShader)

    startButton = createButton("Start")
    startButton.mousePressed(function () {
        points = placePointsInMask(10)
        generateDistanceField()
    })

    canvas.onclick = function () {
        shapePoints.push([mouseX, mouseY])
        console.log(getLines(shapePoints))
        lineRules = getLines(shapePoints)
        generateMask(lineRules)
    }
}

function draw() {
    background(51)

    blendMode(SCREEN)
    image(maskBuffer, 0, 0, w, h)
    blendMode(BLEND)

    for (let i = 0; i < points.length; i++) {
        fill(0)
        ellipse(points[i][0], points[i][1], 10)
    }
}

// creates formulas for the lines between the points
function getLines(points) {
    let output = []
    if (points.length == 1) { return [] }
    for (let i = 0; i < points.length; i++) {
        if (i == points.length - 1) { //if this is the last point, do it one more time, but looped around
            const m = (points[i][1] - points[0][1]) / (points[i][0] - points[0][0])
            const b = points[i][1] - m * points[i][0]
            output.push([m, b, Math.min(points[i][0], points[0][0]), Math.max(points[i][0], points[0][0])])
            return output
        }

        const m = (points[i][1] - points[i + 1][1]) / (points[i][0] - points[i + 1][0])//rise/run
        const b = points[i][1] - m * points[i][0] //b = y-mx
        output.push([m, b, Math.min(points[i][0], points[i + 1][0]), Math.max(points[i][0], points[i + 1][0])])
    }
}

// glsl can't take 2d arrays, and instead makes vectors itself with a 1d array
function makeArray1d(array) {
    let output = []
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            output.push(array[i][j])
        }
    }
    return output
}

function generateMask(lines) {
    maskShader.setUniform("uResolution", [w, h])

    const linesTogether = makeArray1d(lines)
    maskShader.setUniform("uLines", linesTogether)
    maskShader.setUniform("uNumLines", lines.length)

    maskBuffer.shader(maskShader)
    maskBuffer.rect(0, 0, w, h)
}

function placePointsInMask(numPoints) {
    let output = []
    for (let i = 0; i < numPoints; i++) {
        let pointPos = [Math.round(Math.random() * w), Math.round(Math.random() * h)]
        while (maskBuffer.get(pointPos[0], pointPos[1])[0] == 0) {
            pointPos = [Math.round(Math.random() * w), Math.round(Math.random() * h)]
        }
        output.push([pointPos[0], pointPos[1]])
    }
    return output
}

function generateDistanceField() {
    distanceShader.setUniform("uResolution", [w, h])

    const pointsTogether = makeArray1d(points)
    distanceShader.setUniform("uPoints", pointsTogether)
    distanceShader.setUniform("uNumPoints", points.length)
    distanceShader.setUniform("uMask", maskBuffer.get())

    distanceBuffer.shader(distanceShader)
    distanceBuffer.rect(0, 0, w, h)
}

function sumColumns() {
    sumShader.setUniform("uResolution", [w, h])
    sumShader.setUniform("uDepth", distanceBuffer.get())

    sumBuffer.shader(sumShader)
    sumBuffer.rect(0, 0, w, h)
}

/*
!why random pixels in the mask 😩
*/