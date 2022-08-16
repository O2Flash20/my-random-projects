const width = 400
const height = 400

let gridPoints = []
let pts = []
let vels = []

function setup() {
    createCanvas(width, height)
    noStroke()
    for (let x = 0; x < width / gridSpacing; x++) {
        for (let y = 0; y < height / gridSpacing; y++) {
            gridPoints.push(new GridPoint(x * gridSpacing, y * gridSpacing))
        }
    }

    for (let i = 0; i < 50; i++) {
        pts.push(createVector(random(width), random(height)))
        vels.push(createVector(random(-0.5, 0.5), random(-0.5, 0.5)))
    }
}

const gridSpacing = 20

function draw() {
    background(51)
    for (point of gridPoints) {
        point.getVertices()
        point.drawVertices()
    }

    for (let i = 0; i < pts.length; i++) {
        pts[i].add(vels[i])

        if (pts[i].x < 0) {
            pts[i].x = width
        }
        if (pts[i].x > width) {
            pts[i].x = 0
        }
        if (pts[i].y < 0) {
            pts[i].y = height
        }
        if (pts[i].y > height) {
            pts[i].y = 0
        }
    }
}
