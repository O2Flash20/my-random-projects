function include(url, hide) {
    let div = document.createElement("div")
    div.classList.add("projectBox")
    document.getElementById("projects").append(div)

    let iFrame = document.createElement("iframe")
    iFrame.src = url

    if (hide) { iFrame.classList.add("remove") }

    div.append(iFrame)

    div.innerHTML = `${div.innerHTML} <br> <a href="${url}">To Page</a>`

    particles.push({ pos: [Math.random() * window.innerWidth, Math.random() * window.innerHeight], vel: [Math.random() * 10 - 5, Math.random() * 10 - 5] })

    done.push(false)
}

let done = []
function getProjectDetails() {
    for (let i = 0; i < document.getElementById("projects").children.length; i++) {
        let project = document.getElementById("projects").children[i].querySelector("iframe").contentWindow.document
        let projectWindow = document.getElementById("projects").children[i].querySelector("iframe").contentWindow

        if (project.body == null) {
            setTimeout(getProjectDetails, 1000)
            break
        } else if (project.body.innerHTML == "") {
            setTimeout(getProjectDetails, 1000)
            break
        }

        if (!done[i]) {

            document.getElementById("projects").children[i].innerHTML = `<h2>${project.head.querySelector("title").innerText}</h2>${document.getElementById("projects").children[i].innerHTML}`

            // doesnt work because needs full file path
            // using window.location.origin?
            // projectWindow.eval("document.head.classList.add(location.origin)")
            // projectWindow.eval("console.log(location)")
            // console.log(projectWindow.location.origin)
            for (let j = 0; j < project.head.querySelectorAll("script").length; j++) {
                if (project.head.querySelectorAll("script")[j].src == "libraries/p5.min.js") {
                    // console.log("does")
                }
            }
            for (let j = 0; j < project.body.querySelectorAll("script").length; j++) {
                if (project.body.querySelectorAll("script")[j].src !== "") {
                    document.getElementById("projects").children[i].append(document.createElement("br"))
                    let link = document.createElement("a")
                    link.href = project.body.querySelectorAll("script")[j].src
                    link.innerText = "View script"
                    document.getElementById("projects").children[i].append(link)
                }
            }

            for (let j = 0; j < project.head.querySelectorAll("meta").length; j++) {
                if (project.head.querySelectorAll("meta")[j].name == "description") {
                    let p = document.createElement("p")
                    p.innerText = project.head.querySelectorAll("meta")[j].content
                    document.getElementById("projects").children[i].append(p)
                }
            }

            if (document.getElementById("projects").children[i].querySelector("iframe").classList.contains("remove")) {
                document.getElementById("projects").children[i].querySelector("iframe").remove()
            }

            done[i] = true
        }
    }
}

let particles = []
setInterval(function () {
    for (let i = 0; i < particles.length; i++) {
        document.getElementById("projects").children[i].style.top = particles[i].pos[1] + "px"
        document.getElementById("projects").children[i].style.right = particles[i].pos[0] + "px"

        particles[i].pos[0] += particles[i].vel[0]
        particles[i].pos[1] += particles[i].vel[1]

        const xPos = particles[i].pos[0]
        const yPos = particles[i].pos[1]
        if (xPos < 0) {
            particles[i].pos[0] = 1
            particles[i].vel[0] *= -1
        }
        if (xPos > window.innerWidth) {
            particles[i].pos[0] = window.innerWidth - 1
            particles[i].vel[0] *= -1
        }
        if (yPos < 0) {
            particles[i].pos[1] = 1
            particles[i].vel[1] *= -1
        }
        if (yPos > window.innerHeight) {
            particles[i].pos[1] = window.innerHeight - 1
            particles[i].vel[1] *= -1
        }

    }
}, 100)

let projects = []
function get(url) {
    const iframe = document.createElement("iframe")
    iframe.src = url

    document.body.append(iframe)

    setTimeout(function e() {
        projects.push(new Project(iframe.contentWindow))

        iframe.remove()
    }, 1000)
}

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

    for (let i = 0; i < points.length; i++) {
        points[i].add(pVel[i])

        if (points[i].x < -300) { points[i].x = width + 300 }
        if (points[i].x > width + 300) { points[i].x = -300 }
        if (points[i].y < -300) { points[i].y = height + 300 }
        if (points[i].y > height + 300) { points[i].y = -300 }
    }

    gradientShader.setUniform("uRes", [shaderCanvas.width, shaderCanvas.height])
    gradientShader.setUniform("uMousePos", [mouseX, mouseY])

    shaderCanvas.shader(gradientShader)
    shaderCanvas.rect(0, 0, 10, 10)
}

// -------------<triangles>
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

button to open link in now tab

search: concat title and description

when you click to see a certain project, it brings you to a page (same for all of them) which gets the url of the desired project passed in through the location.href (/#...)
    this page then loads an iframe of the desired project, a back button to the index, a link to each script, and the title becomes the project's title

gifs floating around in front of the triangulation which get bigger when clicked?
*/