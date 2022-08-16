let emitter

function setup() {
    createCanvas(400, 400)

    emitter = new Emitter(createVector(random(width), random(height)), createVector(random(-5, 5), random(-5, 5)), 2, 1000, "bounce", 1)

    noStroke()
}

function draw() {
    background(220)

    emitter.emit(createVector(random(-1, 1), random(-1, 1)), "bounce", 0.5, "ellipse", color(51, 51, 51))
    emitter.drawEmitter("blue", 10)
    emitter.draw(5, 5)
    emitter.update()

    for (particle of emitter.particles) {
        particle.applyForce(createVector(0, 0.1))
    }
}

// test image