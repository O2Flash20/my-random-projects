const TurnSpeed = 1

let cameraPosition = [0, 10, 0]
let cameraDirection = [0, 0]
let projectionDist = 1.2

let pressedKeys = []
window.onkeydown = function (e) {
    if (e.key == "x") { mainCanvas.requestPointerLock() }
    pressedKeys[e.key.toLowerCase()] = true
}
window.onkeyup = function (e) { pressedKeys[e.key.toLowerCase()] = false }

function keyPressed(key) {
    return pressedKeys[key] == true
}

// key controls
function updateCamera(dt) {
    let MovementSpeed = 10
    if (keyPressed("shift")) { MovementSpeed *= 3 }

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
        cameraPosition[1] = Math.max(cameraPosition[1] - MovementSpeed * dt, 1.5) 
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
        projectionDist = 0.5
    }
}

// mouse controls
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.querySelector("canvas")) {
        document.addEventListener('mousemove', mouseLook, false)
    } else {
        document.removeEventListener('mousemove', mouseLook, false)
    }
})
function mouseLook(event) {
    const movementX = event.movementX || event.mozMovementX || 0
    const movementY = event.movementY || event.mozMovementY || 0

    cameraDirection[0] += movementX / 1000
    cameraDirection[1] -= movementY / 1000

    cameraDirection[1] = Math.min(Math.max(cameraDirection[1], -Math.PI / 2), Math.PI / 2)
}

// a helper function
function angleToVector(yaw, pitch) {
    const y = Math.sin(pitch)
    const xzMag = Math.cos(pitch)
    const x = -xzMag * Math.sin(yaw)
    const z = xzMag * Math.cos(yaw)
    return [x, y, z]
}