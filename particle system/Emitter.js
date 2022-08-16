class Emitter {
    constructor(pos, vel, frequency, duration, collisionType, bounceAmount) {
        if (!pos) { this.pos = createVector(0, 0) }
        else { this.pos = pos }

        if (!vel) { this.vel = createVector(0, 0) }
        else { this.vel = vel }

        this.acc = createVector(0, 0)

        if (!frequency) { this.frequency = 1 }
        else { this.frequency = frequency }

        if (!duration) { this.duration = 500 }
        else { this.duration = duration }

        this.particles = []

        if (!collisionType) { this.collisionType = "bounce" }
        else { this.collisionType = collisionType }

        if (this.collisionType == "bounce") {
            if (!bounceAmount) { this.bounceAmount = 1 }
            else { this.bounceAmount = bounceAmount }
        }
    }

    applyForce(force) {
        this.acc.add(force)
    }

    update() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update()

            if (this.particles[i].life > this.duration) {
                this.particles.splice(i, 1)
            }
        }

        this.vel.add(this.acc)
        this.pos.add(this.vel)

        this.acc = createVector(0, 0)

        if (this.collisionType == "wrap") {
            if (this.pos.x < 0) { this.pos.x = width }
            if (this.pos.x > width) { this.pos.x = 0 }
            if (this.pos.y < 0) { this.pos.y = height }
            if (this.pos.y > height) { this.pos.y = 0 }
        }
        if (this.collisionType == "bounce") {
            if (this.pos.x < 0) { this.pos.x = 1; this.vel.x *= -this.bounceAmount }
            if (this.pos.x > width) { this.pos.x = width - 1; this.vel.x *= -this.bounceAmount }
            if (this.pos.y < 0) { this.pos.y = 1; this.vel.y *= -this.bounceAmount }
            if (this.pos.y > height) { this.pos.y = height - 1; this.vel.y *= -this.bounceAmount }
        }
    }

    draw(width, height) {
        if (!width) { width = 2 }
        if (!height) { height = 2 }
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(this.particles[i].drawType, width, height)
        }
    }

    drawEmitter(color, radius) {
        fill(color)
        ellipse(this.pos.x, this.pos.y, radius, radius)
    }

    emit(vel, collisionType, bounceAmount, drawType, color) {
        if (!vel) { vel = createVector(0, 0) }
        if (!collisionType) { collisionType = this.acc.collisionType }
        if (!bounceAmount) { bounceAmount = this.bounceAmount }
        if (!drawType) { drawType = "rect" }

        if (this.frequency >= 1) {
            for (let i = 0; i < this.frequency; i++) {
                this.particles.push(new Particle(this.pos.copy(), this.vel.copy().add(vel), collisionType, bounceAmount, drawType, color))
            }
        }
        else {
            if (floor(frameCount % (1 / this.frequency) == 0)) {
                this.particles.push(new Particle(this.pos.copy(), this.vel.copy().add(vel), collisionType, bounceAmount, drawType, color))
            }
        }
    }
}