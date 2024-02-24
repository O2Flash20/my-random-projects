let potentialShader
let equipotentialsShader
let fieldShader
function preload() {
    potentialShader = loadShader("basic.vert", "potential.frag")
    equipotentialsShader = loadShader("basic.vert", "equipotentials.frag")
    fieldShader = loadShader("basic.vert", "field.frag")
}

let c0, c1, c2, c3, composite
function setup() {
    c0 = createCanvas(600, 600)
    c1 = createGraphics(width, height, WEBGL)
    c2 = createGraphics(width, height, WEBGL)
    c3 = createGraphics(width, height, WEBGL)

    composite = createGraphics(width, height)
    composite.elt.style = "display:block !important"
    composite.noStroke()
    composite.textSize(16)
    composite.textAlign(CENTER, CENTER)

    noFill()
    stroke(255, 0, 255)

    pixelDensity(1)
}

let points = [[200, 300, 1], [100, 300, -2], [300, 350, 2]]
function draw() {
    background(0)

    points[0][0] = mouseX
    points[0][1] = mouseY

    potentialShader.setUniform("uCharges", makeArray1d(normalizePositions(points)))
    c1.shader(potentialShader)
    c1.rect(0, 0, 1, 1)

    equipotentialsShader.setUniform("uPotential", c1)
    equipotentialsShader.setUniform("uRes", [width, height])
    c2.shader(equipotentialsShader)
    c2.rect(0, 0, 1, 1)

    c3.clear()
    fieldShader.setUniform("uCharges", makeArray1d(normalizePositions(points)))
    c3.shader(fieldShader)
    c3.rect(0, 0, 1, 1)

    c3.loadPixels()
    // simulate the field lines
    for (let i = 0; i < width; i += width / 5) {
        for (let j = 0; j < width; j += height / 5) {

            let lineTracer = createVector(i, j)
            beginShape()
            for (let k = 0; k < 100; k++) {
                if (lineTracer.x < 0 || lineTracer.x > width || lineTracer.y < 0 || lineTracer.y > height) {
                    break
                }
                vertex(lineTracer.x, lineTracer.y)
                lineTracer.add(getFieldVectorDirection(Math.floor(lineTracer.x), Math.floor(lineTracer.y)).mult(5))
            }
            endShape()

            lineTracer = createVector(i, j)
            beginShape()
            for (let k = 0; k < 100; k++) {
                if (lineTracer.x < 0 || lineTracer.x > width || lineTracer.y < 0 || lineTracer.y > height) {
                    break
                }
                vertex(lineTracer.x, lineTracer.y)
                lineTracer.add(getFieldVectorDirection(Math.floor(lineTracer.x), Math.floor(lineTracer.y)).mult(-5))
            }
            endShape()

        }
    }

    // make the final image
    composite.blendMode(BLEND)
    composite.background(0)

    composite.blendMode(ADD)
    composite.image(c0, 0, 0, width, height)
    composite.image(c2, 0, 0, width, height)

    composite.blendMode(BLEND)
    for (let i = 0; i < points.length; i++) {
        if (points[i][2] < 0) {
            composite.fill(0, 0, 255)
        } else {
            composite.fill(255, 0, 0)
        }
        composite.ellipse(points[i][0], points[i][1], 30 * points[i][2])
        composite.fill(0)
        composite.text(points[i][2] + "nC", points[i][0], points[i][1])
    }
}

// c3.loadPixels !
function getFieldVectorDirection(x, y) {
    const vecRight = c3.pixels[(x + y * width) * 4]
    const vecUp = c3.pixels[(x + y * width) * 4 + 1]
    const vecLeft = c3.pixels[(x + y * width) * 4 + 2]
    const vecDown = c3.pixels[(x + y * width) * 4 + 3]

    return createVector(vecRight - vecLeft, vecUp - vecDown).normalize()
}

function normalizePositions(pointsArray) {
    let output = []
    for (let i = 0; i < pointsArray.length; i++) {
        output.push([pointsArray[i][0] / width, pointsArray[i][1] / height, pointsArray[i][2] * 1e-9])
    }
    return output
}

function makeArray1d(array) {
    let output = []
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            output.push(array[i][j])
        }
    }
    return output
}

// add the ability to grab a charge that is nearby to your cursor and drag and drop it
// plates