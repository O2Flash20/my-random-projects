class Bullet {
    constructor(pos, vel, radius, strength) {
        this.pos = pos
        this.vel = vel
        this.radius = radius
        this.strength = strength
    }

    update() {
        // this.pos.add(this.vel)
        const numOfSteps = Math.round(this.vel.mag())
        const velNorm = this.vel.copy().normalize()

        // take small steps with a length of 1 so as not to skip over potential collisions
        // console.log(velNorm)
        for (let i = 0; i < numOfSteps; i++) {
            this.pos.add(velNorm)

            const collision = this.collision()
            if (collision) { return collision }
        }
    }

    collision() {
        // console.log(this.pos)
        const posFloor = createVector(Math.floor(this.pos.x), Math.floor(this.pos.y))
        if (Structure[posFloor.x] && Structure[posFloor.x][posFloor.y]) {
            if (Structure[Math.floor(this.pos.x)][Math.floor(this.pos.y)]) {
                return posFloor
            }
        }
        return null
    }

    draw() {
        c.fill(255, 0, 0)
        c.rect(this.pos.x, this.pos.y, 2)
    }
}