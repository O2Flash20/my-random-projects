const w = 600
const h = w

let distanceBuffer
let distanceShader

let points = [] //"shops"

let densityMap

function preload() {
    distanceBuffer = createGraphics(w, h, WEBGL)
    distanceShader = loadShader("basic.vert", "distance.frag")

    densityMap = loadImage("maps/USDensity.png")
}

let startButton
function setup() {
    pixelDensity(1)
    createCanvas(w, h)

    distanceBuffer.shader(distanceShader)

    frameRate(10000)

    // *Don't actually need the initial thing lol, the slide is too powerful
    // points = calculateInitialPointPos(10)
    for (let i = 0; i < 10; i++) {
        points.push([random(0, 600), random(0, 600)])
    }
    console.log(averageDistanceField())
}

// POINT SLIDING CONTROLS
const initialSlideAmount = 200
const iterationsUntilSlideAmountIs1 = 100

// constants needed for a rational function made with the above parameters ( form y = a/(x-b) )
const a = iterationsUntilSlideAmountIs1 - (iterationsUntilSlideAmountIs1 / (1 - initialSlideAmount))
const b = iterationsUntilSlideAmountIs1 / (1 - initialSlideAmount)
//------------------------

let numIterations = 0
let lastLowest = 1000000000
let lowestPos = [[0, 10]]
function draw() {
    numIterations++

    image(densityMap, 0, 0)
    for (let i = 0; i < points.length; i++) {
        ellipse(points[i][0], points[i][1], 5)
    }

    slidePoints(points, a / (numIterations - b))
}

function calculateInitialPointPos(numPoints) {
    let points = []
    for (let i = 0; i < numPoints; i++) {
        let thisBestPos = []
        let thisBestScore = Infinity
        for (let x = 0; x < 600; x += 20) {
            for (let y = 0; y < 600; y += 20) {
                points[i] = [x, y]
                generateDistanceField(points)
                const score = averageDistanceField()
                if (score < thisBestScore) {
                    thisBestPos = [x, y]
                    thisBestScore = score
                }
            }
        }
        points[i] = thisBestPos
    }

    return points
}

// slides the points around in the direction that best affects the score
function slidePoints(points, slideAmount) {
    for (let i = 0; i < points.length; i++) {
        generateDistanceField(points)
        const originalScore = averageDistanceField()

        points[i][0] += slideAmount
        generateDistanceField(points)
        const rightScore = averageDistanceField() - originalScore

        points[i][0] -= slideAmount
        generateDistanceField(points)
        const leftScore = averageDistanceField() - originalScore

        points[i][1] += slideAmount
        generateDistanceField(points)
        const upScore = averageDistanceField() - originalScore

        points[i][1] -= slideAmount
        generateDistanceField(points)
        const downScore = averageDistanceField() - originalScore

        // the coordinates are made negative because a negative score means you want to move that way, not away from it
        // this is essentially a vector with length of the slide amount in the direction that the point should move
        const slide = createVector(-(rightScore - leftScore), -(upScore - downScore)).setMag(slideAmount)
        points[i][0] += slide.x
        points[i][1] += slide.y
    }

    return points
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

function generateDistanceField(p) {
    distanceShader.setUniform("uResolution", [w, h])

    const pointsTogether = makeArray1d(p)
    distanceShader.setUniform("uPoints", pointsTogether)
    distanceShader.setUniform("uNumPoints", p.length)
    distanceShader.setUniform("uDensity", densityMap)

    distanceBuffer.shader(distanceShader)
    distanceBuffer.rect(0, 0, w, h)
}

function averageDistanceField() {
    distanceBuffer.loadPixels()
    const pix = distanceBuffer.pixels
    let sum = 0
    for (let i = 0; i < pix.length; i += 4) {
        sum += pix[i]
    }
    return sum / (600 ** 2)
}

/*
TODO:
areas people can't walk through? (a separate image)
maybe do a random start a few times and finally choose the best
make a pretty visualization of the distances
*/

/* Assumptions:
People can cross through 0-density areas
*/