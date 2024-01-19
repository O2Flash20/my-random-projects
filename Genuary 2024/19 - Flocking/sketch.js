let flock = []

function setup() {
    createCanvas(600, 400)

    for (let i = 0; i < 100; i++) {
        flock.push(new Boid(createVector(random(width), random(height)), p5.Vector.random2D()))
    }

    noStroke()
}

function draw() {
    background(51)

    for (let boid of flock) {
        boid.align(flock, 50, 0.05)
        boid.cohesion(flock, 50, 0.06)
        boid.separation(flock, 50, 0.055)
        boid.evade(createVector(mouseX, mouseY), 100, 1)
    }
    for (let boid of flock) {
        boid.update()
        boid.show()
    }
}
