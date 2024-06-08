const TurnSpeed = 1

let cameraPosition = [0, 10, 0]
let cameraDirection = [0, 0]
let projectionDist = 0.8

let pressedKeys = []
window.onkeydown = function (e) { pressedKeys[e.key] = true }
window.onkeyup = function (e) { pressedKeys[e.key] = false }

function keyPressed(key) {
    return pressedKeys[key] == true
}

function updateCamera(dt) {
    let MovementSpeed = 2
    if (keyPressed("Shift")) { MovementSpeed *= 4 }

    if (keyPressed("w")) {
        const movementDirection = angleToVector(cameraDirection[0], 0)
        cameraPosition[0] += MovementSpeed * dt * movementDirection[0]
        cameraPosition[1] += MovementSpeed * dt * movementDirection[1]
        cameraPosition[2] += MovementSpeed * dt * movementDirection[2]
    }
    if (keyPressed("s")) {
        const movementDirection = angleToVector(cameraDirection[0] + Math.PI, 0)
        cameraPosition[0] += MovementSpeed * dt * movementDirection[0]
        cameraPosition[1] += MovementSpeed * dt * movementDirection[1]
        cameraPosition[2] += MovementSpeed * dt * movementDirection[2]
    }
    if (keyPressed("a")) {
        const movementDirection = angleToVector(cameraDirection[0] - Math.PI / 2, 0)
        cameraPosition[0] += MovementSpeed * dt * movementDirection[0]
        cameraPosition[1] += MovementSpeed * dt * movementDirection[1]
        cameraPosition[2] += MovementSpeed * dt * movementDirection[2]
    }
    if (keyPressed("d")) {
        const movementDirection = angleToVector(cameraDirection[0] + Math.PI / 2, 0)
        cameraPosition[0] += MovementSpeed * dt * movementDirection[0]
        cameraPosition[1] += MovementSpeed * dt * movementDirection[1]
        cameraPosition[2] += MovementSpeed * dt * movementDirection[2]
    }

    if (keyPressed("q")) {
        cameraPosition[1] -= MovementSpeed * dt
    }
    if (keyPressed("e")) {
        cameraPosition[1] += MovementSpeed * dt
    }

    if (keyPressed("ArrowLeft")) {
        cameraDirection[0] -= TurnSpeed * dt
    }
    if (keyPressed("ArrowRight")) {
        cameraDirection[0] += TurnSpeed * dt
    }
    if (keyPressed("ArrowUp")) {
        cameraDirection[1] = Math.min(cameraDirection[1] + TurnSpeed * dt, Math.PI / 2)
    }
    if (keyPressed("ArrowDown")) {
        cameraDirection[1] = Math.max(cameraDirection[1] - TurnSpeed * dt, -Math.PI / 2)
    }

    if (keyPressed("c")) {
        projectionDist = 2
    }
    else {
        projectionDist = 0.8
    }
}

function angleToVector(yaw, pitch) {
    const y = Math.sin(pitch)
    const xzMag = Math.cos(pitch)
    const x = -xzMag * Math.sin(yaw)
    const z = xzMag * Math.cos(yaw)
    return [x, y, z]
}