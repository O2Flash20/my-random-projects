const width = 600
const height = 400
const graphMargins = 50

function setup() {
    createCanvas(600, 400)
    Data = getItem("Data")

    if (!Data) { Data = [[[0, now()]], [[0, now()]], [[0, now()]]] }
}

function draw() {
    frameRate(1)

    background(255)

    strokeWeight(6)
    stroke(0)
    rect(0, 0, width, height)

    // axes
    strokeWeight(1)
    stroke(0)
    line(graphMargins, height - graphMargins, width - graphMargins, height - graphMargins)
    line(graphMargins, height - graphMargins, graphMargins, graphMargins)

    // draw the scales and lines

    stroke(0); strokeWeight(1); textAlign(CENTER, CENTER)
    drawScales()

    // label of axes
    fill(0)
    text("Time (Days)", width / 2, height - 20)
    push()
    rotate(1.5708)
    text("Lab Credit Score", height / 2, -15)
    pop()

    // draw all the points and lines
    strokeWeight(3)
    drawPoints()
}

// Date.now() but faster
function now() {
    return Date.now()
}

// adds a data point to the graph
function addData(person, score, days) {
    Data[person].push([score, days])
    saveData()
}

// saves the data locally
function saveData() {
    storeItem("Data", Data)
}

// returns the time passed (in ms) since the start of the graph
function getDeltaTime() {
    const today = now()
    let oldestTime = today

    for (const person of Data) {
        for (const entry of person) {
            if (entry[1] < oldestTime) { oldestTime = entry[1] }
        }
    }

    return today - oldestTime
}

// returns the highest score in Data
function getDeltaScore() {
    let highestScore = 0
    for (let person of Data) {
        for (let entry of person) {
            if (entry[0] > highestScore) { highestScore = entry[0] }
        }
    }

    return highestScore
}

// writes the scale on the x and y axis
function drawScales() {
    // x-axis
    const daysPassed = Math.floor(getDeltaTime() / 8.64e7)
    const skipIntervalX = Math.floor(daysPassed / 10) + 1
    for (let i = 0; i <= daysPassed; i += skipIntervalX) {
        const xPos = map(i, 0, daysPassed, graphMargins, width - graphMargins)
        stroke(0)
        text(i, xPos, height - graphMargins + 10)
        stroke(125)
        line(xPos, height - graphMargins, xPos, graphMargins)
    }

    // y-axis
    const mostPoints = getDeltaScore()
    const skipIntervalY = Math.floor(mostPoints / 20) + 1
    for (let i = 0; i <= mostPoints; i += skipIntervalY) {
        if (i != 0) {
            const yPos = map(i, 0, mostPoints, height - graphMargins, graphMargins)
            stroke(0)
            text(i, graphMargins - 15, yPos)
            stroke(125)
            line(graphMargins, yPos, width - graphMargins, yPos)
        }
    }
    const yPos = graphMargins
    stroke(0)
    text(mostPoints, graphMargins - 15, yPos)
    stroke(125)
    line(graphMargins, yPos, width - graphMargins, yPos)
}

// draws the points and lines of the graph
function drawPoints() {
    for (let i = 0; i < 3; i++) {
        // set the color
        if (i == 0) { fill(255, 0, 0); stroke(255, 0, 0) }
        if (i == 1) { fill(0, 255, 255); stroke(0, 255, 255) }
        if (i == 2) { fill(0, 255, 0); stroke(0, 255, 0) }

        // draw all the data points
        beginShape()
        for (const point of Data[i]) {
            const x = map(point[1], now() - getDeltaTime(), now(), graphMargins, width - graphMargins)
            const y = map(point[0], 0, getDeltaScore(), height - graphMargins, graphMargins)

            vertex(x, y)
            ellipse(x, y, 5, 5)
        }
        // extend the graph to "now"
        const nowX = width - graphMargins
        const lastScore = Data[i][Data[i].length - 1][0]
        const nowY = map(lastScore, 0, getDeltaScore(), height - graphMargins, graphMargins)
        vertex(nowX, nowY)
        ellipse(nowX, nowY, 5, 5)

        noFill()
        endShape()
    }
}

// [[score, now], [score, now]]
let Data = [
    // matthew
    [],

    // william
    [],

    // caleb
    []
]

// enters a point, used in the ui
function matthewEnter() {
    let scoreValue = eval(document.getElementById("matthewInput").value)
    scoreValue += Data[0][Data[0].length - 1][0]
    addData(0, scoreValue, now())
}

function williamEnter() {
    let scoreValue = eval(document.getElementById("williamInput").value)
    scoreValue += Data[1][Data[1].length - 1][0]
    addData(1, scoreValue, now())
}

function calebEnter() {
    let scoreValue = eval(document.getElementById("calebInput").value)
    scoreValue += Data[2][Data[2].length - 1][0]
    addData(2, scoreValue, now())
}