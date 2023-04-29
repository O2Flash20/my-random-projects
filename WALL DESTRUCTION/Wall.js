class Wall {
    constructor(pos, size) {
        this.pos = pos
        this.size = size

        this.grid = []
        for (let x = 0; x < size.x; x++) {
            let yStrip = []
            for (let y = 0; y < size.y; y++) {
                yStrip.push(1)
            }

            this.grid.push(yStrip)
        }
    }

    draw(color) {
        rectMode(CORNER)

        fill(100, 0, 0)
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y)

        fill(color)
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                if (this.grid[x][y] == 1) {
                    rect(x + this.pos.x, y + this.pos.y, 1, 1)
                }
            }
        }
    }

    break(relativePos, radius, strength, hitVel) {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                const dist = (x - relativePos.x) ** 2 + (y - relativePos.y) ** 2
                if (
                    dist < radius ** 2
                    && this.grid[x][y] == 1
                ) {
                    this.grid[x][y] = 0

                    let particleVel = createVector(x, y).sub(relativePos).add(createVector(Math.random(), Math.random())).mult((radius ** 2 - dist) / radius ** 2 * strength)

                    const forwardAmount = hitVel.copy().normalize().dot(particleVel.copy().normalize())

                    Particles.push(new Particle(
                        createVector(x, y).add(this.pos),
                        particleVel.copy().add(particleVel.mult(Math.max(forwardAmount, -0.6) * 2)),
                        "bounce",
                        0.1,
                        "rect",
                        color(255, 0, 0),
                    ))
                }
            }
        }
    }
}