let points = []
let yMax = 0
let yMin = 0
let xMax = 0
let xMin = 0

function setup() {
    createCanvas(800, 800)
    fill(255)
    stroke(255)
}

let M = 0
let B = 0

let margin = 0.8
function draw() {
    background(51)

    push()
    scale(margin, margin)
    translate((1 / margin) * width * (0.5 - margin / 2), (1 / margin) * height * (0.5 - margin / 2))

    // actual points
    for (let i = 0; i < points.length; i++) {
        ellipse(
            map(points[i].x, xMin, xMax, 0, width),
            map(points[i].y, yMin, yMax, height, 0),
            5,
            5
        )
    }

    // theoretical line
    line(
        map(xMin, xMin, xMax, 0, width),
        map(5 * xMin + 1, yMin, yMax, height, 0),
        map(xMax, xMin, xMax, 0, width),
        map(5 * xMax + 1, yMin, yMax, height, 0),
    )

    // axes
    line(
        map(xMin - 1, xMin, xMax, 0, width),
        height,
        map(xMax + 1, xMin, xMax, 0, width),
        height
    )
    line(
        0,
        map(yMin - 1, yMin, yMax, height, 0),
        0,
        map(yMax + 1, yMin, yMax, height, 0)
    )
    pop()

    console.log(M, B)
}

// importing a csv file
document.getElementById("pointsInput").addEventListener("change", function (event) {
    points = []

    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = function (e) {
        const csv = e.target.result
        const lines = csv.split('\r\n')

        lines.forEach(function (line) {
            const columns = line.split(',')
            addPointToList(float(columns[0]), float(columns[1]))
        })

        const gradientDescentResult = gradientDescent(0, 0, 0.000001)
        // console.log(t)
        M = gradientDescentResult.m
        B = gradientDescentResult.b
    }

    reader.readAsText(file)


})

function addPointToList(x, y) {
    if (x < xMin) {
        xMin = x
    } else if (x > xMax) {
        xMax = x
    }
    if (y < yMin) {
        yMin = y
    } else if (y > yMax) {
        yMax = y
    }

    points.push(createVector(x, y))
}

function getMeanY() {
    let total = 0

    for (let i = 0; i < points.length; i++) {
        total += points[i].y
    }

    return total / points.length
}

function sumOfSquaredErrors(m, b) {
    let totalError = 0
    for (let i = 0; i < points.length; i++) {
        const theoretical = (m * points[i].x + b)
        const error = points[i].y - theoretical
        totalError += error ** 2
    }
    return totalError
}

function totalSumOfSquares() {
    const meanY = getMeanY()

    let total = 0
    for (let i = 0; i < points.length; i++) {
        total += (points[i].y - meanY) ** 2
    }

    return total
}

function gradientDescent(m, b, learningRate) {

    b = 0


    for (let i = 0; i < 10000; i++) {
        const dErrorBYdm = (sumOfSquaredErrors(m + 0.01, b) - sumOfSquaredErrors(m, b)) / 0.01
        m = m - learningRate * dErrorBYdm

        const dErrorBYdb = (sumOfSquaredErrors(m, b + 0.01) - sumOfSquaredErrors(m, b)) / 0.01
        b = b - learningRate * dErrorBYdb


        if (Math.abs(dErrorBYdm) < 0.01 && Math.abs(dErrorBYdb) < 0.01) { break }
    }

    return { m, b }
}

function getRSquared(m, b) {
    return 1 - sumOfSquaredErrors(m, b) / totalSumOfSquares()
}
