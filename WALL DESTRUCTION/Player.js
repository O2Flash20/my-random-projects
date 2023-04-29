class Player extends Entity {
    constructor(pos, size) {
        super(pos, size)
    }

    draw() {
        c.fill(0, 100, 255)
        c.ellipse(this.pos.x, this.pos.y, this.size.x, this.size.y)
    }

    move(displacement) {
        this.pos.add(displacement)
    }

    shoot(velocityMagnitude, radius, strength) {
        Bullets.push(new Bullet(
            this.pos.copy(),
            createVector(mouseX / 10, mouseY / 10).sub(this.pos).normalize().mult(velocityMagnitude),
            radius,
            strength
        ))
    }
}