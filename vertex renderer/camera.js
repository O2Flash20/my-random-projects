import * as mat4 from "./gl-matrix/mat4.js"
import * as vec3 from "./gl-matrix/vec3.js"

let pressedKeys = []
window.onkeydown = function (e) { pressedKeys[e.key.toLowerCase()] = true }
window.onkeyup = function (e) { pressedKeys[e.key.toLowerCase()] = false }

function keyPressed(key) {
    return pressedKeys[key] == true
}

export default class Camera {
    constructor(x, y, z, pitch, yaw) {
        this.pos = { x: x, y: y, z: z }
        this.rot = { pitch: pitch, yaw: yaw }

        this.fov = 90
        this.movementSpeed = 4
    }

    // a helper function
    angleToVector(pitch, yaw) {
        const y = Math.sin(pitch)
        const xzMag = Math.cos(pitch)
        const x = -xzMag * Math.sin(yaw)
        const z = xzMag * Math.cos(yaw)
        return { x, y, z }
    }

    move(dt, pitch, yaw) {
        const movementDirection = this.angleToVector(pitch, yaw)
        this.pos.x += this.movementSpeed * dt * movementDirection.x
        this.pos.y += this.movementSpeed * dt * movementDirection.y
        this.pos.z += this.movementSpeed * dt * movementDirection.z
    }

    update(dt) {
        if (keyPressed("shift")) { this.movementSpeed = 10 }

        if (keyPressed("c")) { this.fov = 30 }
        else { this.fov = 90 }

        if (keyPressed("w")) { this.move(dt, 0, this.rot.yaw) }
        if (keyPressed("s")) { this.move(dt, 0, this.rot.yaw + Math.PI) }
        if (keyPressed("a")) { this.move(dt, 0, this.rot.yaw - Math.PI / 2) }
        if (keyPressed("d")) { this.move(dt, 0, this.rot.yaw + Math.PI / 2) }

        if (keyPressed("e")) { this.move(dt, -Math.PI / 2, 0) }
        if (keyPressed("q")) { this.move(dt, Math.PI / 2, 0) }

        if (keyPressed("arrowright")) { this.rot.yaw += 2 * dt }
        if (keyPressed("arrowleft")) { this.rot.yaw -= 2 * dt }
        if (keyPressed("arrowup")) { this.rot.pitch -= this.rot.pitch <= -Math.PI / 2 ? 0 : 2 * dt }
        if (keyPressed("arrowdown")) { this.rot.pitch += this.rot.pitch >= Math.PI / 2 ? 0 : 2 * dt }
    }

    getViewMatrix() {
        let viewMatrix = mat4.create()

        mat4.fromXRotation(viewMatrix, this.rot.pitch)
        mat4.rotateY(viewMatrix, viewMatrix, this.rot.yaw)
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(this.pos.x, this.pos.y, this.pos.z))

        return viewMatrix
    }

    getProjectionMatrix(aspectRatio) {
        let projectionMatrix = mat4.create()

        return mat4.perspective(projectionMatrix, Math.PI * (this.fov) / 180, aspectRatio, 0.1, 1000)
    }

    // returns a float32Array that is a 4x4 matrix with all the transformations and rotations the camera needs
    getCameraMatrix(aspectRatio) {
        let cameraMatrix = mat4.create()

        const view = this.getViewMatrix()
        const projection = this.getProjectionMatrix(aspectRatio)
        mat4.multiply(cameraMatrix, projection, view)

        return cameraMatrix
    }
}