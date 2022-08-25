const width = 1920
const height = 1080

// IMAGE OF GRADIENT UNDER THE TRIANGLES

function setup() {
    createCanvas(width, height)
    addPoints()
    noStroke()
}

function draw() {
    background(25)
    getTriangles()

    for (let i = 0; i < points.length; i++) {
        points[i].add(pVel[i])

        if (points[i].x < -300) { points[i].x = width + 300 }
        if (points[i].x > width + 300) { points[i].x = -300 }
        if (points[i].y < -300) { points[i].y = height + 300 }
        if (points[i].y > height + 300) { points[i].y = -300 }
    }
}

let points = []
let pVel = []
function addPoints() {
    for (let i = 0; i < 75; i++) {
        points.push(createVector(random(-300, width + 300), random(-300, height + 300)))
        ellipse(points[i].x, points[i].y, 1, 1)
        pVel.push(createVector(random(-1, 1), random(-1, 1)))
    }

    points.push(createVector(-300, -300))
    points.push(createVector(width + 300, -300))
    points.push(createVector(-300, height + 300))
    points.push(createVector(width + 300, height + 300))
}

function getTriangles() {
    // add super triangle
    let superTriangle = new Triangle(createVector(-300, width * 4), createVector(height * 4, -300), createVector(-300, -300))
    let triangles = []
    triangles.push(superTriangle)

    // add points one at a time
    for (let point of points) {
        let badTriangles = []
        let badTrianglesI = []
        let badTrianglesEdges = []

        // 
        let i = -1
        for (let triangle of triangles) {
            i++ //triangles index
            const c = triangle.getCircumcircle()
            if (dist(point.x, point.y, c.point[0], c.point[1]) < c.radius) {
                badTriangles.push(triangle)
                badTrianglesI.push(i)
                for (let edge of triangle.edges) {
                    badTrianglesEdges.push(edge)
                }
            }
        }

        let polygon = []
        for (let triangle of badTriangles) {
            for (let edge of triangle.edges) {
                let sameEdges = 0
                for (let bEdge of badTrianglesEdges) {
                    if (edge[0].x == bEdge[0].x) {
                        if (edge[0].y == bEdge[0].y) {
                            if (edge[1].x == bEdge[1].x) {
                                if (edge[1].y == bEdge[1].y) {
                                    sameEdges++
                                }
                            }
                        }
                    }
                }
                if (sameEdges < 2) {
                    polygon.push(edge)
                }
            }
        }
        // remove the bad ones, looping backwards in the list of indices
        for (let j = badTrianglesI.length - 1; j >= 0; j--) {
            triangles.splice(badTrianglesI[j], 1)
        }

        for (let edge of polygon) {
            const newTri = new Triangle(edge[0], edge[1], point)
            triangles.push(newTri)
        }
    }

    for (let j = triangles.length - 1; j >= 0; j--) {
        let b = false
        for (let vertex of triangles[j].vertices) {
            if (b) { break }
            for (let vertexS of superTriangle.vertices) {
                if (vertex.x == vertexS.x && vertex.y == vertexS.y) {
                    triangles.splice(j, 1)
                    b = true
                    break
                }
            }
        }
    }

    for (let t of triangles) {
        t.draw()
    }

    return triangles
}


function HSVtoRGB(h, s, v) {
    h = map(h, 0, 360, 0, 1)
    var r, g, b, i, f, p, q, t
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h
    }
    i = Math.floor(h * 6)
    f = h * 6 - i
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    // bro what is a switch function
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break
        case 1: r = q, g = v, b = p; break
        case 2: r = p, g = v, b = t; break
        case 3: r = p, g = q, b = v; break
        case 4: r = t, g = p, b = v; break
        case 5: r = v, g = p, b = q; break
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}