const w = 600
const h = w

let distanceBuffer
let distanceShader

let sumColBuffer
let sumColShader

let sumRowBuffer
let sumRowShader

let points = [] //"shops"

let densityMap

function preload() {
    distanceBuffer = createGraphics(w, h, WEBGL)
    distanceShader = loadShader("basic.vert", "distance.frag")

    sumColBuffer = createGraphics(w, 15, WEBGL) //compress down into 15 rows
    sumColShader = loadShader("basic.vert", "sumCol.frag")

    sumRowBuffer = createGraphics(15, 15, WEBGL) //compress down into 15 columns also
    sumRowShader = loadShader("basic.vert", "sumRow.frag")

    densityMap = loadImage("maps/test1.png")
}

let startButton
function setup() {
    pixelDensity(1)
    createCanvas(w, h)

    distanceBuffer.shader(distanceShader)
    sumColBuffer.shader(sumColShader)

    startButton = createButton("Start")
    startButton.mousePressed(function () {
        points = generatePoints(10)
        generateDistanceField()
    })
}

function draw() {
    background(51)
    for (let i = 0; i < points.length; i++) {
        ellipse(points[i][0], points[i][1], 10)
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

function generatePoints(numPoints) {
    let output = []
    for (i = 0; i < numPoints; i++) {
        output.push([Math.floor(Math.random() * w), Math.floor(Math.random() * h)])
    }
    return output
}

function generateDistanceField() {
    distanceShader.setUniform("uResolution", [w, h])

    const pointsTogether = makeArray1d(points)
    distanceShader.setUniform("uPoints", pointsTogether)
    distanceShader.setUniform("uNumPoints", points.length)
    distanceShader.setUniform("uDensity", densityMap)

    distanceBuffer.shader(distanceShader)
    distanceBuffer.rect(0, 0, w, h)
}

function sumColumns() {
    sumColShader.setUniform("uResolution", [w, 15])
    sumColShader.setUniform("uDistances", distanceBuffer.get())

    sumColBuffer.shader(sumColShader)
    sumColBuffer.rect(0, 0, w, 15)
}

function sumRows() {
    sumRowShader.setUniform("uResolution", [15, 15])
    sumRowShader.setUniform("uDistances", sumColBuffer.get())

    sumRowBuffer.shader(sumRowShader)
    sumRowBuffer.rect(0, 0, 15, 15)
}

/*
TODO:
areas people can't walk through? (a separate image)
*/

/* Assumptions:
People can cross through 0-density areas
*/