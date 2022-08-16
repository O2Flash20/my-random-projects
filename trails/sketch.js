let width = 1920
let height = 1080

let noiseSize = 0.001
let vectorGrid = [...Array(width)].map(e => Array(height))
let particles = []

let noiseStrength = 7

function setup() {
    createCanvas(width, height)
    noStroke()
    noSmooth()

    frameRate(60)

    for (i = 0; i < 6000; i++) {
        particles.push(new Particle(random(width), random(height)))
    }

}

let zNoise = 0
function draw() {
    zNoise += 0.007

    background(15, 15, 15, 100)

    for (particle of particles) {
        particle.update()
        particle.draw()
    }
}

class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y)
    }

    move(vector) {
        this.pos.add(vector)
    }

    draw() {
        const x = abs(this.xMove / noiseStrength)
        const y = abs(this.yMove / noiseStrength)
        if (x + y > 0.9) { fill(255, 255, 255) }
        else if (x + y < 0.1) { fill(0, 100, 100) }
        else if (abs(x - y) < 0.1) { fill(0, 255, 255) }
        else if (x >= y) { fill(0, 255, 100) }
        else { fill(0, 100, 255) }

        rect(this.pos.x, this.pos.y, 2, 2)
    }

    update() {
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            this.pos.x = random(width)
            this.pos.y = random(height)
        }

        // const xMove = map(noise(this.pos.x * noiseSize, this.pos.y * noiseSize, zNoise), 0, 1, -noiseStrength, noiseStrength)
        // const yMove = map(noise(this.pos.x * noiseSize, this.pos.y * noiseSize, zNoise + 10), 0, 1, -noiseStrength, noiseStrength)
        this.xMove = map(noise(this.pos.x * noiseSize, this.pos.y * noiseSize, zNoise), 0, 1, -noiseStrength, noiseStrength)
        this.yMove = map(noise(this.pos.x * noiseSize, this.pos.y * noiseSize, zNoise + 10), 0, 1, -noiseStrength, noiseStrength)
        this.move(createVector(this.xMove, this.yMove))
    }
}