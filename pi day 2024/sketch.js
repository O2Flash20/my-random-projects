let graphC, errorLabel, errorValue
function setup() {
    createCanvas(500, 500)
    background(0)
    ellipse(250, 250, 500)
    noStroke()
    fill(255, 0, 0)

    graphC = createGraphics(500, 200)

    errorLabel = createSpan("Percent error to real value: ")
    errorValue = createSpan()
}

let valuesFound = []

let numInCircle = 0
let drawn = 0
let t = 0
let highestError = 0
let lowestError = 100
function draw() {
    let pointPos
    for (let i = 0; i < 100; i++) {
        pointPos = createVector(Math.random() - 0.5, Math.random() - 0.5).mult(2)
        if (pointPos.magSq() < 1) {
            numInCircle++
        }
        drawn++

    }
    ellipse(pointPos.x * 250 + 250, pointPos.y * 250 + 250, 2.5)

    const thisCalculatedPi = 4 * (numInCircle / drawn)
    const thisError = piPercentError(thisCalculatedPi)

    if (thisError < lowestError) {
        lowestError = thisError
    }
    else if (thisError > highestError) {
        highestError = thisError
    }

    document.getElementById("pInSquare").innerText = drawn
    document.getElementById("pInCircle").innerText = numInCircle
    document.getElementById("piVal").innerText = thisCalculatedPi
    errorValue.elt.innerText = thisError * 100 + "%"

    valuesFound.push([t, 1 - thisError])

    if (valuesFound.length > 700) {
        valuesFound.splice(0, 1)
    }

    graphC.background(200)
    graphC.fill(0)

    const minMaxGraphValues = findMinMaxValues(valuesFound)
    for (let i = 0; i < valuesFound.length - 1; i++) {
        graphC.line(
            map(valuesFound[i][0], minMaxGraphValues[0][0], minMaxGraphValues[0][1], 10, 490),
            map(valuesFound[i][1], minMaxGraphValues[1][0], minMaxGraphValues[1][1], 50, 150),

            map(valuesFound[i + 1][0], minMaxGraphValues[0][0], minMaxGraphValues[0][1], 10, 490),
            map(valuesFound[i + 1][1], minMaxGraphValues[1][0], minMaxGraphValues[1][1], 50, 150)
        )
    }

    t += deltaTime / 1000
}

function findMinMaxValues(array) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -100
    let maxY = -100

    for (let i = 0; i < array.length; i++) {
        const a = array[i]
        if (a[0] < minX) { minX = a[0] }
        if (a[0] > maxX) { maxX = a[0] }
        if (a[1] < minY) { minY = a[1] }
        if (a[1] > maxY) { maxY = a[1] }
    }

    return [[minX, maxX], [minY, maxY]]
}

function piPercentError(value) {
    return Math.abs(value - Math.PI) / Math.PI
}