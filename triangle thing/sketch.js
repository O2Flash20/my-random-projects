let points = []
let vels = []
let triangles = []
const width = 1920
const height = 1080

function setup() {
    createCanvas(width, height)

    for (let i = 0; i < 500; i++) {
        points.push(createVector(random(width), random(height)))
        vels.push(createVector(random(-1, 1), random(-1, 1)))
    }

}

function draw() {
    background(51)

    fill(255)

    for (let i = 0; i < points.length; i++) {
        points[i].add(vels[i])

        if (points[i].x < 0) {
            points[i].x = width
        }
        if (points[i].y < 0) {
            points[i].y = height
        }
        if (points[i].x > width) {
            points[i].x = 0
        }
        if (points[i].y > height) {
            points[i].y = 0
        }
    }

    triangles = []
    for (i = 0; i < points.length; i++) {
        const point1 = points[i]
        let closestDist = Infinity
        let closestIndex = -1

        for (let j = 0; j < points.length; j++) {
            if (points[j] !== point1) {
                if (dist(point1.x, point1.y, points[j].x, points[j].y) < closestDist) {
                    closestIndex = j
                    closestDist = dist(point1.x, point1.y, points[j].x, points[j].y)
                }
            }
        }
        const point2 = points[closestIndex]

        const midpoint = createVector((point2.x + point1.x) / 2, (point2.y + point1.y) / 2)

        closestDist = Infinity
        closestIndex = -1
        for (let j = 0; j < points.length; j++) {
            if (points[j] !== point1 && points[j] !== point2) {
                if (dist(midpoint.x, midpoint.y, points[j].x, points[j].y) < closestDist) {
                    closestIndex = j
                    closestDist = dist(midpoint.x, midpoint.y, points[j].x, points[j].y)
                }
            }
        }
        const point3 = points[closestIndex]

        triangles.push([point1, point2, point3])
    }

    for (triangle of triangles) {
        drawTriangle(triangle)
    }
}

function drawTriangle(triangle) {
    stroke(255)

    const a = triangle[0]
    const b = triangle[1]
    const c = triangle[2]

    line(a.x, a.y, b.x, b.y)
    line(b.x, b.y, c.x, c.y)
    line(c.x, c.y, a.x, a.y)
}