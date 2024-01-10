let points

function setup() {
    createCanvas(600, 600)
    points = subdividePointsList(
        generateHexagonPoints(200),
        100
    )
    stroke("white")
    strokeWeight(3)
}

let t = 0
function draw() {
    background(51)

    translate(width / 2, height / 2)

    push()
    translate(width / 3, -height / 3)
    scale(0.4)
    drawPointsList(
        lerpPointsListToSquare(points, (Math.sin(t) + 1) / 2, 200)
    )
    pop()

    push()
    scale(0.4)
    drawPointsList(
        lerpPointsListToCircle(points, (Math.sin(t) + 1) / 2, 200)
    )
    pop()

    push()
    translate(-width / 3, height / 3)
    scale(0.4)
    drawPointsList(
        lerpPointsListToTriangle(points, (Math.sin(t) + 1) / 2, 200)
    )
    pop()

    t += deltaTime / 1000
}

function generateHexagonPoints(radius) {
    let output = []

    let point = createVector(radius, 0)
    for (let i = 0; i < 6; i++) {
        output.push(point.copy().rotate(i * Math.PI / 3))
    }

    return output
}

function subdividePointsList(pointsList, amount) {
    let output = []

    for (let i = 0; i < pointsList.length; i++) {
        for (j = 0; j < amount; j++) { //between every two original points, add `amount` more
            const pointBefore = pointsList[i].copy()
            const pointAfter = pointsList[(i + 1) % pointsList.length].copy()
            output.push(pointBefore.lerp(pointAfter, j / amount))
        }
    }

    return output
}

function drawPointsList(pointsList) {
    for (let i = 0; i < pointsList.length - 1; i++) {
        line(pointsList[i].x, pointsList[i].y, pointsList[i + 1].x, pointsList[i + 1].y)
    }
    line(pointsList[pointsList.length - 1].x, pointsList[pointsList.length - 1].y, pointsList[0].x, pointsList[0].y)
}

function lerpPointsListToCircle(pointsList, amount, circleRadius) {
    let output = []
    for (let i = 0; i < pointsList.length; i++) {
        output.push(pointsList[i].copy().lerp(pointsList[i].copy().normalize().mult(circleRadius), amount))
    }
    return output
}

function lerpPointsListToSquare(pointsList, amount, squareRadius) {
    let output = []

    const pointsOnCircle = lerpPointsListToCircle(pointsList, 1, Math.sqrt(2) * squareRadius) //projects the points onto a circle first so that they're more evenly spaced when turned into a square. the sqrt(2) makes it so that there's a point on each corner of the square
    for (let i = 0; i < pointsList.length; i++) {
        // const p = pointsList[i]
        const p = pointsOnCircle[i]
        let pointOnSquare

        if (p.x > 0 && p.x >= Math.abs(p.y)) { //it should go to the right edge of the square
            pointOnSquare = createVector(squareRadius, p.y)
        }
        if (p.x < 0 && -p.x >= Math.abs(p.y)) { //it should go to the left edge of the square
            pointOnSquare = createVector(-squareRadius, p.y)
        }

        if (p.y > 0 && p.y >= Math.abs(p.x)) { //it should go to the top edge of the square
            pointOnSquare = createVector(p.x, squareRadius)
        }
        if (p.y < 0 && -p.y >= Math.abs(p.x)) { //it should go to the top edge of the square
            pointOnSquare = createVector(p.x, -squareRadius)
        }

        output.push(pointsList[i].copy().lerp(pointOnSquare, amount))
    }
    return output
}

function lerpPointsListToTriangle(pointsList, amount, triangleBase) { //equilateral, so base==height
    let output = []

    const pointsOnCircle = lerpPointsListToCircle(pointsList, 1, triangleBase * 2) //projects the points onto a circle first so that they're more evenly spaced when turned into a square. the sqrt(2) makes it so that there's a point on each corner of the square
    for (let i = 0; i < pointsList.length; i++) {
        const p = pointsOnCircle[i]
        let pointOnTriangle

        const intDown = findIntersection(createVector(0, 0), p, createVector(-triangleBase, -triangleBase), createVector(triangleBase, -triangleBase + 0.01))
        if (intDown !== null) { //the point should go to the bottom edge
            pointOnTriangle = intDown
        }

        const intLeft = findIntersection(createVector(0, 0), p, createVector(-triangleBase, -triangleBase), createVector(0, triangleBase))
        if (intLeft !== null) { //the point should go to the left edge
            pointOnTriangle = intLeft
        }

        const intRight = findIntersection(createVector(0, 0), p, createVector(triangleBase, -triangleBase), createVector(0, triangleBase))
        if (intRight !== null) { //the point should go to the right edge
            pointOnTriangle = intRight
        }

        output.push(pointsList[i].copy().lerp(pointOnTriangle, amount))
    }
    return output
}

function findIntersection(l1p1, l1p2, l2p1, l2p2) {
    const slope1 = (l1p1.y - l1p2.y) / (l1p1.x - l1p2.x)
    const slope2 = (l2p1.y - l2p2.y) / (l2p1.x - l2p2.x)

    const intercept1 = l1p1.y - slope1 * l1p1.x
    const intercept2 = l2p1.y - slope2 * l2p1.x

    const x = (intercept2 - intercept1) / (slope1 - slope2)
    const y = slope1 * x + intercept1

    const l1MinX = Math.min(l1p1.x, l1p2.x)
    const l1MaxX = Math.max(l1p1.x, l1p2.x)
    const l1MinY = Math.min(l1p1.y, l1p2.y)
    const l1MaxY = Math.max(l1p1.y, l1p2.y)

    const l2MinX = Math.min(l2p1.x, l2p2.x)
    const l2MaxX = Math.max(l2p1.x, l2p2.x)
    const l2MinY = Math.min(l2p1.y, l2p2.y)
    const l2MaxY = Math.max(l2p1.y, l2p2.y)

    if (
        x <= Math.min(l1MaxX, l2MaxX) && x >= Math.max(l1MinX, l2MinX) &&
        y <= Math.min(l1MaxY, l2MaxY) && y >= Math.max(l1MinY, l2MinY)
    ) {
        return createVector(x, y)
    } else {
        return null
    }
}