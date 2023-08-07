let raymarchingShader
let cameraPosition
let cameraRotation

function preload() {
    raymarchingShader = loadShader("raymarch.vert", "raymarch.frag")
}

function setup() {
    pixelDensity(1)
    createCanvas(1920, 1080, WEBGL)
    noStroke()

    cameraPosition = createVector(0, 0, 0)
    cameraRotation = createVector(0, 0, 0)
}

function draw() {
    // rotation
    if (keyIsDown(38)) {
        cameraRotation.add(createVector(-1, 0, 0).mult(deltaTime / 500))
    }
    if (keyIsDown(40)) {
        cameraRotation.add(createVector(1, 0, 0).mult(deltaTime / 500))
    }
    if (keyIsDown(37)) {
        cameraRotation.add(createVector(0, -1, 0).mult(deltaTime / 500))
    }
    if (keyIsDown(39)) {
        cameraRotation.add(createVector(0, 1, 0).mult(deltaTime / 500))
    }

    // movement
    if (keyIsDown(87)) {
        const moveBy = createVector(0, 1).rotate(-cameraRotation.y).mult(deltaTime / 200)
        cameraPosition.set(cameraPosition.x + moveBy.x, cameraPosition.y, cameraPosition.z + moveBy.y)
    }
    if (keyIsDown(65)) {
        const moveBy = createVector(-1, 0).rotate(-cameraRotation.y).mult(deltaTime / 200)
        cameraPosition.set(cameraPosition.x + moveBy.x, cameraPosition.y, cameraPosition.z + moveBy.y)
    }
    if (keyIsDown(83)) {
        const moveBy = createVector(0, -1).rotate(-cameraRotation.y).mult(deltaTime / 200)
        cameraPosition.set(cameraPosition.x + moveBy.x, cameraPosition.y, cameraPosition.z + moveBy.y)
    }
    if (keyIsDown(68)) {
        const moveBy = createVector(1, 0).rotate(-cameraRotation.y).mult(deltaTime / 200)
        cameraPosition.set(cameraPosition.x + moveBy.x, cameraPosition.y, cameraPosition.z + moveBy.y)
    }
    if (keyIsDown(16)) {
        cameraPosition.add(createVector(0, -1, 0).mult(deltaTime / 200))
    }
    if (keyIsDown(32)) {
        cameraPosition.add(createVector(0, 1, 0).mult(deltaTime / 200))
    }

    background(220)
    raymarchingShader.setUniform("uResolution", [width, height])
    raymarchingShader.setUniform("uTime", frameCount)
    raymarchingShader.setUniform("uCameraPos", [cameraPosition.x, cameraPosition.y, cameraPosition.z])
    raymarchingShader.setUniform("uCameraRot", [cameraRotation.x, cameraRotation.y, cameraRotation.z])

    shader(raymarchingShader)

    rect(0, 0, width, height)
}