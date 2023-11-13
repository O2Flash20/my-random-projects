let NUMOFPOINTS = 40

const w = 600
const h = w

let distanceBuffer
let distanceShader

let points = [] //"shops"

let densityMap
let densityInput

let exportInfoButton
let bestImg

let visualizationBuffer
let visualizationShader

function preload() {
    distanceBuffer = createGraphics(w, h, WEBGL)
    distanceShader = loadShader("basic.vert", "distance.frag")

    visualizationBuffer = createGraphics(w, h, WEBGL)
    visualizationBuffer.elt.style.display = "block"
    visualizationShader = loadShader("basic.vert", "vis.frag")

    densityMap = loadImage("maps/theBeach.png")

    bestImg = createImage(w, h)
}

let startButton
function setup() {
    pixelDensity(1)
    createCanvas(w, h)

    distanceBuffer.shader(distanceShader)
    visualizationBuffer.shader(visualizationShader)

    frameRate(10000)

    for (let i = 0; i < NUMOFPOINTS; i++) {
        points.push([random(0, 600), random(0, 600)])
    }

    densityInput = createFileInput(handleFile)

    exportInfoButton = createButton("Download Results")
    exportInfoButton.mouseClicked(downloadInfo)

    fill(255, 0, 0)
    noStroke()
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
            numberOfTries = 0
            document.getElementById("iterationsDisplay").innerText = 0
            pastScores = []
            bestPoints = []
        }, 100)

    } else {
        // If the selected file is not an image, show an error message
        console.log('Please choose an image file.')
    }
}

function downloadInfo() {
    let pointsObject = {}
    for (let i = 0; i < bestPoints.length; i++) {
        pointsObject[i] = bestPoints[i]
    }
    createStringDict(pointsObject).saveJSON("Distance Minimization Results")

    bestImg.save("Best Point Positions")
}

// POINT SLIDING CONTROLS
const initialSlideAmount = 200
const iterationsUntilSlideAmountIs1 = 100

// constants needed for a rational function made using the above parameters ( form y = a/(x-b) )
const a = iterationsUntilSlideAmountIs1 - (iterationsUntilSlideAmountIs1 / (1 - initialSlideAmount))
const b = iterationsUntilSlideAmountIs1 / (1 - initialSlideAmount)
//------------------------

let numIterations = 0
let numberOfTries = 0
let pastScores = []
let bestPoints = []
function draw() {
    image(densityMap, 0, 0)
    for (let i = 0; i < points.length; i++) {
        ellipse(points[i][0], points[i][1], 8)
    }

    points = slidePoints(points, a / (numIterations - b))

    // after some time, save this score and restart
    if (numIterations > iterationsUntilSlideAmountIs1) {
        const thisScore = averageDistanceField()

        for (let i = 0; i < pastScores.length; i++) {
            if (thisScore < pastScores[i]) {
                bestPoints = points
                bestImg.set(0, 0, get())
            }
        }
        if (pastScores.length == 0) {
            bestPoints = points
            bestImg.set(0, 0, get())
        }

        pastScores.push(thisScore)

        points = []
        for (let i = 0; i < NUMOFPOINTS; i++) {
            points.push([random(0, 600), random(0, 600)])
        }
        numIterations = 0

        numberOfTries++
        document.getElementById("iterationsDisplay").innerText = numberOfTries
    }

    updateVis()

    numIterations++
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

// a shader that calculates the distance from each pixel to the nearest point
function generateDistanceField(pts) {
    distanceShader.setUniform("uResolution", [w, h])

    const pointsTogether = makeArray1d(pts)
    distanceShader.setUniform("uPoints", pointsTogether)
    distanceShader.setUniform("uNumPoints", pts.length)
    distanceShader.setUniform("uDensity", densityMap)

    distanceBuffer.shader(distanceShader)
    distanceBuffer.rect(0, 0, w, h)
}

// loops over every pixel's distance and returns the average distance
function averageDistanceField() {
    distanceBuffer.loadPixels()
    const pix = distanceBuffer.pixels
    let sum = 0
    for (let i = 0; i < pix.length; i += 4) {
        sum += pix[i]
    }
    return sum / (600 ** 2)
}

function updateVis() {
    visualizationShader.setUniform("uResolution", [w, h])
    visualizationShader.setUniform("uDist", distanceBuffer)
    visualizationShader.setUniform("uDensity", densityMap) //!doesnt update when densityMap updates... AND get() causes the gpu memory leak
    visualizationShader.setUniform("uNumPoints", NUMOFPOINTS)
    visualizationShader.setUniform("uKeyColors", makeArray1d(
        [[0.1, 0.35, 1, 1], [0.2, 0.35, 1, 0.31], [0.35, 0.172, 1, 1], [0.5, 0.083, 1, 1], [0.75, 0, 1, 1], [0.9, 0, 1, 0.2]]
    ))

    visualizationBuffer.shader(visualizationShader)
    visualizationBuffer.rect(0, 0, w, h)
}

/*
TODO:
?areas people can't walk through? (a separate image)
*/

/* Assumptions:
People can cross through 0-density areas
*/