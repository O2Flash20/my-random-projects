let NUMOFPOINTS = 15

let densityInput

const w = 600
const h = w

let distanceBuffer
let distanceShader

let points = [] //"shops"

let densityMap

function preload() {
    distanceBuffer = createGraphics(w, h, WEBGL)
    distanceShader = loadShader("basic.vert", "distance.frag")

    densityMap = loadImage("maps/test1.png")
}

let startButton
function setup() {
    pixelDensity(1)
    createCanvas(w, h)

    distanceBuffer.shader(distanceShader)

    frameRate(10000)

    for (let i = 0; i < NUMOFPOINTS; i++) {
        points.push([random(0, 600), random(0, 600)])
    }

    densityInput = createFileInput(handleFile)
    densityInput.position(10, height + 10)
}

// Callback function to handle the file input
function handleFile(file) {
    // Check if the file is an image
    if (file.type === 'image') {
        // Create an image element and load the selected image
        img = createImg(file.data, '')
        img.hide() // Hide the image element

        setTimeout(function () {
            // replace the density map with this new image
            image(img, 0, 0, 600, 600)
            densityMap.set(0, 0, get())

            // reset everything, now that there's a new image
            numIterations = 0
            pastScores = []
            bestPoints = []
        }, 100)

    } else {
        // If the selected file is not an image, show an error message
        console.log('Please choose an image file.')
    }
}

// POINT SLIDING CONTROLS
const initialSlideAmount = 200
const iterationsUntilSlideAmountIs1 = 100

// constants needed for a rational function made with the above parameters ( form y = a/(x-b) )
const a = iterationsUntilSlideAmountIs1 - (iterationsUntilSlideAmountIs1 / (1 - initialSlideAmount))
const b = iterationsUntilSlideAmountIs1 / (1 - initialSlideAmount)
//------------------------

let numIterations = 0
let pastScores = []
let bestPoints = []
function draw() {
    image(densityMap, 0, 0)
    // background(51, 51, 51, 50)
    for (let i = 0; i < points.length; i++) {
        ellipse(points[i][0], points[i][1], 5)
    }

    points = slidePoints(points, a / (numIterations - b))

    // after some time, save this score and restart
    if (numIterations > iterationsUntilSlideAmountIs1 * 1.5) {
        const thisScore = averageDistanceField()

        for (let i = 0; i < pastScores.length; i++) {
            if (thisScore < pastScores[i]) {
                bestPoints = points
            }
        }
        if (pastScores.length == 0) {
            bestPoints = points
        }

        pastScores.push(thisScore)

        points = []
        for (let i = 0; i < NUMOFPOINTS; i++) {
            points.push([random(0, 600), random(0, 600)])
        }
        numIterations = 0
    }

    numIterations++
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
function slidePoints(pts, slideAmount) {
    // copy pts without referencing it, or else it will do some weird stuff
    let pointsOut = []
    for (let i = 0; i < pts.length; i++) {
        pointsOut[i] = []
        pointsOut[i][0] = pts[i][0]
        pointsOut[i][1] = pts[i][1]
    }

    for (let i = 0; i < pts.length; i++) {
        generateDistanceField(pointsOut)
        const originalScore = averageDistanceField()

        pointsOut[i][0] = pts[i][0] - slideAmount
        generateDistanceField(pointsOut)
        const leftScore = averageDistanceField() - originalScore

        pointsOut[i][0] = pts[i][0] + slideAmount
        generateDistanceField(pointsOut)
        const rightScore = averageDistanceField() - originalScore

        pointsOut[i][1] = pts[i][1] + slideAmount
        generateDistanceField(pointsOut)
        const upScore = averageDistanceField() - originalScore

        pointsOut[i][1] = pts[i][1] - slideAmount
        generateDistanceField(pointsOut)
        const downScore = averageDistanceField() - originalScore

        // this is essentially a vector with length of the slide amount in the direction that the point should move
        const slide = createVector(rightScore - leftScore, upScore - downScore).setMag(slideAmount)

        // if the point thinks all hope is lost for helping the score, throw it somewhere new and it will find something
        if (slide.x == 0 && slide.y == 0) {
            pointsOut[i][0] = random(0, 600)
            pointsOut[i][1] = random(0, 600)
        }
        else {
            // the slide amount is subtracted because you want to move away from the place that gives you a higher score
            pointsOut[i][0] = pts[i][0] - slide.x
            pointsOut[i][1] = pts[i][1] - slide.y
        }
    }

    return pointsOut
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

function generateDistanceField(pts) {
    distanceShader.setUniform("uResolution", [w, h])

    const pointsTogether = makeArray1d(pts)
    distanceShader.setUniform("uPoints", pointsTogether)
    distanceShader.setUniform("uNumPoints", pts.length)
    distanceShader.setUniform("uDensity", densityMap)

    distanceBuffer.shader(distanceShader)
    distanceBuffer.rect(0, 0, w, h)
}

// loops over every pixel in the distances array and returns the average distance
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
?areas people can't walk through? (a separate image)
easy inputs/outputs
make a pretty visualization of the distances
*/

/* Assumptions:
People can cross through 0-density areas
*/