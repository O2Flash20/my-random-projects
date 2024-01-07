let metaballsShader
function preload() {
    metaballsShader = loadShader("basic.vert", "metaballs.frag")
}

function setup() {
    createCanvas(600, 600, WEBGL)
    background(0)
}

let ballsPos = []
let ballsVel = []

let t = 0
function draw() {
    t += deltaTime / 1000

    while (ballsPos.length < 20) {
        let pos = p5.Vector.random2D().setMag(1000)
        const vel = pos.copy().mult(random(-0.005, -0.01))
        pos.add(createVector(width / 2, height / 2))
        ballsPos.push(pos)
        ballsVel.push(vel)
    }

    // update the physics
    for (let i = 0; i < ballsPos.length; i++) {
        ballsPos[i].add(ballsVel[i])
    }

    for (let i = ballsPos.length - 1; i >= 0; i--) {
        if (Math.abs(ballsPos[i].x - width / 2) < 10 && Math.abs(ballsPos[i].y - height / 2) < 10) {
            ballsPos.splice(i, 1)
            ballsVel.splice(i, 1)
        }
    }

    metaballsShader.setUniform("uProgress", (t % 45 / 100))
    metaballsShader.setUniform("uBalls", convertVec2ForGLSL(ballsPos))
    shader(metaballsShader)
    rect(0, 0, 1, 1)
}

function convertVec2ForGLSL(arrayOfVectors) {
    let output = []
    for (let i = 0; i < arrayOfVectors.length; i++) {
        output.push(arrayOfVectors[i].x / width)
        output.push(arrayOfVectors[i].y / height)
    }

    return output
}