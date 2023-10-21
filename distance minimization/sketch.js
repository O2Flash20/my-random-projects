const w = 600
const h = w

let distanceBuffer
let distanceShader

let sumColBuffer
let sumColShader

let sumRowBuffer
let sumRowShader

let testShader
let testBuffer

let points = [] //"shops"

let densityMap

function preload() {
    distanceBuffer = createGraphics(w, h, WEBGL)
    distanceShader = loadShader("basic.vert", "distance.frag")

    sumColBuffer = createGraphics(w, 15, WEBGL) //compress down into 15 rows
    sumColShader = loadShader("basic.vert", "sumCol.frag")

    sumRowBuffer = createGraphics(15, 15, WEBGL) //compress down into 15 columns also
    sumRowShader = loadShader("basic.vert", "sumRow.frag")

    testShader = loadShader("basic.vert", "basesTest.frag")
    testBuffer = createGraphics(100, 100, WEBGL)

    densityMap = loadImage("maps/test3.1.png")
}

let startButton
function setup() {
    pixelDensity(1)
    createCanvas(w, h)

    distanceBuffer.shader(distanceShader)
    sumColBuffer.shader(sumColShader)
    sumRowBuffer.shader(sumRowShader)
    testBuffer.shader(testShader)

    startButton = createButton("Start")
    startButton.mousePressed(function () {
        points = generatePoints(3)
        generateDistanceField()
        console.log(sumDistances())
    })
    frameRate(1000)
}

let lastLowest = 1000000000
let lowestPos = [[0, 10]]
function draw() {
    background(51, 51, 51, 10)
    points = generatePoints(1)
    generateDistanceField()
    // for (let i = 0; i < points.length; i++) {
    //     ellipse(points[i][0], points[i][1], 10)
    // }
    if (sumDistances() < lastLowest) {
        lowestPos = points
        lastLowest = sumDistances()
        console.log(lastLowest)
    }
    ellipse(lowestPos[0][0], lowestPos[0][1], 10)
    ellipse(300, 300, 5)
    frameRate(10)
}
// make the point at the mouse pointer for better testing?

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

function sumColumns(buffer) {
    sumColShader.setUniform("uResolution", [w, 15])
    sumColShader.setUniform("uDistances", buffer.get())

    sumColBuffer.shader(sumColShader)
    sumColBuffer.rect(0, 0, w, 15)
}

function sumRows(buffer) {
    sumRowShader.setUniform("uResolution", [15, 15])
    sumRowShader.setUniform("uDistances", buffer.get())

    sumRowBuffer.shader(sumRowShader)
    sumRowBuffer.rect(0, 0, 15, 15)
}

function sumDistances() {
    sumColumns(distanceBuffer)
    sumRows(sumColBuffer)
    sumRowBuffer.loadPixels()
    const p = sumRowBuffer.pixels
    let sum = 0

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const thisIndex = (i * 15 + j) * 4
            sum += (p[thisIndex] * 65025 + p[thisIndex + 1] * 255 + p[thisIndex + 2])
        }
    }
    sumRowBuffer.updatePixels()
    // let sum = 0
    // for (let i = 0; i < 15; i++) {
    //     for (let j = 0; j < 15; j++) {
    //         sum += base255ToDecimal(sumRowBuffer.get(i, j))
    //     }
    // }

    return sum
}

function base255ToDecimal(base255) {
    return base255[0] * 65025 + base255[1] * 255 + base255[2]
}

/*
TODO:
areas people can't walk through? (a separate image)
*/

/* Assumptions:
People can cross through 0-density areas
*/

function test() {
    // testShader.setUniform("Number", 100000)
    // testBuffer.shader(testShader)
    // testBuffer.rect(10, 10)
    // console.log(base255ToDecimal(testBuffer.get(1, 1)))

    sumColumns(densityMap)
}