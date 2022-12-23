class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y)
        this.vel = createVector(0, 0)
        this.acc = createVector(0, 0)

        this.locked = false
    }

    lock() {
        this.locked = true
    }

    applyForce(forceVector) {
        this.acc.add(forceVector)
    }

    update() {
        if (!this.locked) {
            this.vel.mult(0.99)
            this.vel.add(this.acc)
            this.pos.add(this.vel)
            this.acc.mult(0)
        }
    }

    display() {
        fill(255)
        ellipse(this.pos.x, this.pos.y, 10, 10)
    }
}