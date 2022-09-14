let projects = []
function get(url) {
    const iframe = document.createElement("iframe")
    iframe.addEventListener('load', function () {
        projects.push(new Project(iframe.contentWindow))

        iframe.remove()
    })
    iframe.src = url

    document.body.append(iframe)
}

// to do it manually
function addProject(url, title, description) {
    projects.push({
        url,
        title,
        description
    })
}


// let words = ["Among Us", "Funny", "Haha"]
let scores = []
function search(keyword) {
    scores = []
    // each word
    for (let i = 0; i < projects.length; i++) {
        const word = projects[i].title + projects[i].description
        scores.push(0)
        // each letter
        for (let j = 0; j < word.length; j++) {
            // each letter in the keyword
            const offset = 0.01 * j
            for (let k = 0; k < keyword.length; k++) {
                if (word[j + k] && keyword[k]) {
                    if (word[j + k].toLowerCase() == keyword[k].toLowerCase()) {
                        scores[i] += (1 - offset)
                    }
                }
            }
        }
    }
    // scores in corresponding index -> list of indices from highest to lowest scores -> load projects in that order

    let scoresOrdered = []
    let cap = Infinity
    for (let i = 0; i < scores.length; i++) {
        let bestScore = -1
        let bestScoreI = -1
        for (let i = 0; i < scores.length; i++) {
            if (scores[i] > bestScore && scores[i] < cap) {
                bestScoreI = i
                bestScore = scores[i]
            }
        }

        scoresOrdered.push(bestScoreI)
        cap = scores[bestScoreI]
        // scores.splice(bestScoreI, 1)
    }

    console.log(scoresOrdered)
    loadProjectsSide(scoresOrdered)
    return scoresOrdered
}
// search("")

function loadProjectsSide(order) {
    document.getElementById("projects").innerHTML = ''
    if (!order) {
        order = []
        for (let i = 0; i < projects.length; i++) { order.push(i) }
    }

    for (let i = 0; i < order.length; i++) {
        let div = document.createElement("div")
        div.classList.add("projectCell")
        document.getElementById("projects").append(div)

        let name = document.createElement("p")
        name.innerText = projects[order[i]].title
        div.append(name)

        let desc = document.createElement("p")
        desc.classList.add("projectDesc")
        desc.innerText = projects[order[i]].description
        div.append(desc)

        let link = document.createElement("a")
        link.href = projects[order[i]].url
        link.innerText = "Go to"
        div.append(link)
    }
}
setTimeout(loadProjectsSide, 1000)
// loadProjectsSide()

document.getElementById("searchKey").addEventListener("change", function () {
    search(document.getElementById("searchKey").value)
})


// --------------------------------------------
// --------------------------------------------
// --------------------------------------------

const width = 1920
const height = 1080

let shaderCanvas
let gradientShader

let shaderElm

let bg
let noise
function preload() {
    bg = loadImage("_index scripts/bg.png")
    noise = loadImage("_index scripts/noise.png")

    gradientShader = loadShader("_index scripts/mouseG.vert", "_index scripts/mouseG.frag")
}

function setup() {
    createCanvas(width, height)
    addPoints()
    strokeWeight(2)

    shaderCanvas = createGraphics(400, 800, WEBGL)
    shaderCanvas.canvas.id = "shaderCanvas"
    shaderElm = shaderCanvas.canvas
}

function draw() {
    background(25)

    blendMode(BLEND)
    image(bg, 0, 0, width, height)

    getTriangles()

    blendMode(EXCLUSION)
    image(noise, 0, 0, width, height)

    shaderCanvas.width = innerWidth / 4

    for (let i = 0; i < points.length; i++) {
        points[i].add(pVel[i])

        if (points[i].x < -300) { points[i].x = width + 300 }
        if (points[i].x > width + 300) { points[i].x = -300 }
        if (points[i].y < -300) { points[i].y = height + 300 }
        if (points[i].y > height + 300) { points[i].y = -300 }
    }

    gradientShader.setUniform("uRes", [shaderCanvas.width, shaderCanvas.height])
    gradientShader.setUniform("uCanvasPos", [innerWidth * (3 / 4), 0])
    gradientShader.setUniform("uMousePos", [mouseX * (innerWidth / 2560), mouseY])

    shaderCanvas.shader(gradientShader)
    shaderCanvas.rect(0, 0, 10, 10)
}

// -------------<triangles>
let points = []
let pVel = []
function addPoints() {
    for (let i = 0; i < 50; i++) {
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
    // bro what is a switch function lol
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
// -----------</triangles>


/*
get function
    title
    description
    link

button to open link in new tab

search: concat title and description

when you click to see a certain project, it brings you to a page (same for all of them) which gets the url of the desired project passed in through the location.href (/#...)
    this page then loads an iframe of the desired project, a back button to the index, a link to each script, and the title becomes the project's title

gifs floating around in front of the triangulation which get bigger when clicked?

LOADING SCREEN
*/