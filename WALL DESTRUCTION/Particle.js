class Particle {
    constructor(pos, vel, collisionType, bounceAmount, drawType, color) {
        if (!pos) { this.pos = createVector(0, 0) }
        else { this.pos = pos }

        if (!vel) { this.vel = createVector(0, 0) }
        else { this.vel = vel }

        this.acc = createVector(0, 0)

        this.life = 0

        /*
        wrap
        bounce
        none
        */
        if (!collisionType) { this.collisionType = "bounce" }
        else { this.collisionType = collisionType }

        if (this.collisionType == "bounce") {
            if (!bounceAmount) { this.bounceAmount = 1 }
            else { this.bounceAmount = bounceAmount }
        }

        if (drawType) { this.drawType = drawType }
        if (color) { this.color = color }
    }

    applyForce(force) {
        this.acc.add(force)
    }

    update() {
        this.vel.add(this.acc)
        this.pos.add(this.vel)

        this.acc = createVector(0, 0)

        this.life++

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
}