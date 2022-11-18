const width = 600
const height = 400

function setup() {
    createCanvas(600, 400)
    Data = getItem("Data")
}

function draw() {
    background(51)

    const graphMargins = 50
    stroke(255, 255, 255)
    line(graphMargins, height - graphMargins, width - graphMargins, height - graphMargins)
    line(graphMargins, height - graphMargins, graphMargins, graphMargins)

    fill(255, 255, 255)
    text(0, graphMargins - 10, height - graphMargins + 10)
}

function daysSinceEpoch() {
    return Math.floor(new Date() / 8.64e7)
}

function addData(person, score, days) {
    Data[person].push([score, days])
    saveData()
}

function saveData() {
    storeItem("Data", Data)
}

// returns the days between the first and the last bit of data
// extend the graph until "today"?
function getDeltaTime() {
    let highestTime = 0
    let lowestTime = Infinity
    for (let person of Data) {
        for (let entry of person) {
            if (entry[1] > highestTime) { highestTime = entry[1] }
            if (entry[1] < lowestTime) { lowestTime = entry[1] }
        }
    }

    console.log(highestTime, lowestTime)

    return highestTime - lowestTime
}

// returns the highest score in Data
function getDeltaScore() {
    highestScore = 0
    for (let person of Data) {
        for (let entry of person) {
            if (entry[0] > highestScore) { highestScore = entry[0] }
        }
    }

    return highestScore
}

// [[score, daysSinceEpoch], [score, daysSinceEpoch]]
let Data = [
    // matthew
    [],

    // william
    [],

    // caleb
    []
]

// input points for Matthew:__ Caleb:__ William:__
// graph setup
// draws a line through all the points, time on the x points on the y

// get the amount of days that have passed since first data (highest-lowest)
// get set up the scale of points (0 is the lowest, if someone gets under, it leaves the graph XD)