class Emitter {
    constructor(pos, charge, mass, lifeMax) {
        this.pos = pos
        this.charge = charge
        this.mass = mass
        this.lifeMax = lifeMax
        this.particles = []
    }

    emit() {
        this.particles.push(new Particle(
            this.pos.copy(),
            createVector(random(-1, 1), random(-1, 1)),
            this.charge,
            this.mass
        ))
    }

    applyElectricForce() {
        for (let p of this.particles) {
            p.applyElectricForce()
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].life > this.lifeMax || this.particles[i].pos.x < 0 || this.particles[i].pos.x > width || this.particles[i].pos.y < 0 || this.particles[i].pos.y > height) {
                this.particles.splice(i, 1)
            }
        }
        for (let p of this.particles) {
            p.update(dt)
        }
    }

    draw(canvas) {
        for (let p of this.particles) {
            p.draw(canvas)
        }
    }
}