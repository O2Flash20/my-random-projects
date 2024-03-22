let step
function setup() {
    createCanvas(600, 600)

    createP("Step Size:")
    step = createSlider(0.001, 1, 0.5, 0.01)

    stroke(255)
    strokeWeight(4)
}

function draw() {
    background(51)

    // set up the points in the shape of a square
    let points = []
    for (let i = -1; i < 1; i += step.value()) {
        points.push(createVector(i, 1))
    }
    for (let i = -1; i < 1; i += step.value()) {
        points.push(createVector(1, -i))
    }
    for (let i = -1; i < 1; i += step.value()) {
        points.push(createVector(-i, -1))
    }
    for (let i = -1; i < 1; i += step.value()) {
        points.push(createVector(-1, i))
    }

    // project the points into a circle (behind the scenes, this uses the pythagorean theorem)
    let circlePoints = []
    for (let i = 0; i < points.length; i++) {
        circlePoints.push(points[i].copy().normalize())
    }

    const scaleWidth = width - 60
    const scaleHeight = height - 60

    // add up the distances between the points to calculate the circumference
    let totalLength = 0
    for (let i = 0; i < circlePoints.length; i++) {
        line(
            scaleWidth / 2 * circlePoints[i % circlePoints.length].x + width / 2,
            scaleHeight / 2 * circlePoints[i % circlePoints.length].y + height / 2,
            scaleWidth / 2 * circlePoints[(i + 1) % circlePoints.length].x + width / 2,
            scaleHeight / 2 * circlePoints[(i + 1) % circlePoints.length].y + height / 2
        )
        totalLength += circlePoints[i].dist(circlePoints[(i + 1) % circlePoints.length])
    }

    document.getElementById("circumference").innerText = totalLength
    document.getElementById("pi").innerText = totalLength / 2
}