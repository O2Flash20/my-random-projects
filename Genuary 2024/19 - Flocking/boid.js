class Boid {
    constructor(pos, vel) {
        this.pos = pos
        this.vel = vel
        this.acc = createVector(0, 0)
        this.maxSpeed = 2
    }

    align(boids, dist, strength) {
        let steering = createVector(0, 0)
        let boidsInDist = 0
        // make it check for boids on the other side of an edge by tiling the boids a lot of times 
        for (let i = 0; i < boids.length; i++) {
            const d = this.pos.dist(boids[i].pos)
            if (d < dist && boids[i] !== this) {
                steering.add(boids[i].vel)
                boidsInDist++
            }
        }

        if (boidsInDist > 0) {
            steering.div(boidsInDist)
            steering.setMag(this.maxSpeed)
            // this.vel = this.vel.copy().add(steering).normalize()
            steering.sub(this.vel)
            this.acc.add(steering.limit(strength))
        }
    }

    cohesion(boids, dist, strength) {
        let steering = createVector(0, 0)
        let boidsInDist = 0
        // make it check for boids on the other side of an edge by tiling the boids a lot of times 
        for (let i = 0; i < boids.length; i++) {
            const d = this.pos.dist(boids[i].pos)
            if (d < dist && boids[i] !== this) {
                steering.add(boids[i].pos)
                boidsInDist++
            }
        }

        if (boidsInDist > 0) {
            steering.div(boidsInDist)
            steering.sub(this.pos)
            steering.setMag(this.maxSpeed)
            steering.sub(this.vel)
            this.acc.add(steering.limit(strength))
        }
    }

    separation(boids, dist, strength) {
        let steering = createVector(0, 0)
        let boidsInDist = 0
        // make it check for boids on the other side of an edge by tiling the boids a lot of times 
        for (let i = 0; i < boids.length; i++) {
            const d = this.pos.dist(boids[i].pos)
            if (d < dist && boids[i] !== this) {
                let difference = this.pos.copy().sub(boids[i].pos)
                difference.div(d)
                steering.add(difference)
                boidsInDist++
            }
        }

        if (boidsInDist > 0) {
            steering.div(boidsInDist)
            steering.setMag(this.maxSpeed)
            steering.sub(this.vel)
            this.acc.add(steering.limit(strength))
        }
    }

    evade(mousePos, dist, strength) {
        const d = this.pos.dist(mousePos)
        if (d < dist) {
            this.acc.add(this.pos.copy().sub(mousePos).setMag((dist - d) / d ** 2).mult(d * strength))
        }
    }

    show() {
        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.vel.heading() - PI / 2)
        triangle(-3, -3, 3, -3, 0, 5)
        pop()
    }

    update() {
        this.vel.add(this.acc)
        this.vel.limit(this.maxSpeed)
        this.pos.add(this.vel)
        this.acc.mult(0)

        this.pos.x = (this.pos.x + width * 5) % width
        this.pos.y = (this.pos.y + height * 5) % height
    }
}