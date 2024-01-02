class Particle {
    constructor(pos, vel, mass) {
        this.pos = pos
        this.vel = vel
        this.mass = mass
        this.acc = createVector(0, 0)
        this.netForce = createVector(0, 0)
        // this.age = 0
    }

    applyForce(force) {
        this.netForce.add(force)
    }

    update() {
        this.acc = this.netForce.copy().div(this.mass)
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        // this.age++
    }

    draw() {
        const ms = this.vel.magSq()
        fill(
            map(ms, 0, 100, 240, 360, true),
            map(ms, 0, 100, 70, 100, true),
            50
        )
        ellipse(this.pos.x, this.pos.y, 5)
    }
}

const MAXDIST = 100

let emitter
let particles = []
function setup() {
    createCanvas(1200, 800)
    background(10)
    // emitter = new Emitter(createVector(winMouseX, winMouseY), 100)
    for (let x = 0; x < width; x += 15) {
        for (let y = 0; y < height; y += 15) {
            particles.push(new Particle(createVector(x + random(-2, 2), y + random(-2, 2)), createVector(0, 0), random(0.5, 10)))
        }
    }
    noStroke()
    frameRate(144)
}

let lastMX
let lastMY
function draw() {
    colorMode(RGB, 255)
    background(10, 40)

    colorMode(HSL)

    for (let i = particles.length - 1; i >= 0; i--) {
        const thisParticle = particles[i]
        thisParticle.update()
        thisParticle.draw()

        if (thisParticle.pos.x < -10 || thisParticle.pos.x > width + 10 || thisParticle.pos.y < -10 || thisParticle.pos.y > height + 10) {
            particles.splice(i, 1)
        }
    }

    mouseVel = createVector( //in pixels per second
        frameRate() * (mouseX - lastMX),
        frameRate() * (mouseY - lastMY)
    )

    for (let i = 0; i < particles.length; i++) {
        const thisParticle = particles[i]
        const distToMouse = thisParticle.pos.dist(createVector(mouseX, mouseY))
        if (distToMouse < MAXDIST) {
            thisParticle.applyForce(
                mouseVel.copy().mult(0.0001).mult(1 - (distToMouse / MAXDIST))
            )
        }
    }

    lastMX = mouseX
    lastMY = mouseY
}

function keyPressed() {
    if (keyCode == 82) {
        particles = []
        for (let x = 0; x < width; x += 15) {
            for (let y = 0; y < height; y += 15) {
                particles.push(new Particle(createVector(x + random(-2, 2), y + random(-2, 2)), createVector(0, 0), random(0.5, 10)))
            }
        }
    }
}