let points = []
let vels = []
let pointsNum = 2
let width = 100
let height = 100

function setup() {
    createCanvas(width, height)

    for (let i = 0; i < pointsNum; i++) {
        points.push(createVector(random(width), random(height)))
        vels.push(createVector(random(-1, 1), random(-1, 1)))
    }
    noStroke()
}

function draw() {
    background(51)

    for (let i = 0; i < points.length; i++) {
        points[i].add(vels[i])

        if (points[i].x < 0) {
            vels[i].x *= -1
        }
        if (points[i].y < 0) {
            vels[i].y *= -1
        }
        if (points[i].x > width) {
            vels[i].x *= -1
        }
        if (points[i].y > height) {
            vels[i].y *= -1
        }

        // fill(255)
        // ellipse(points[i].x, points[i].y, 5, 5)
    }

    loadPixels()
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let totalDist = dist(0, 0, width, height)
            for (point of points) {
                totalDist -= dist(x, y, point.x, point.y)
            }
            // console.log(map(totalDist, dist(0, 0, width, height), 0, 0, 255))
            // fill(map(totalDist, dist(0, 0, width, height), 0, 0, 255), 0, 255)
            // rect(x, y, 1, 1)
            pixels[x + y * width] = map(totalDist, dist(0, 0, width, height), 0, 0, 255)
        }
    }
    // pixels[10] = color(255, 255, 255, 255)
    updatePixels()
}
