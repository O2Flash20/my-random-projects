let img
function preload() {
    img = loadImage("particle.png")
}

class RibbonHead {
    constructor(pos, vel, acc) {
        this.pos = pos
        this.vel = vel
        this.acc = acc
        this.col = [random(256), random(256), random(256)]
        this.size = random(10, 30)
    }

    update() {
        if (Math.floor(random(0, 50)) == 1) {
            this.acc.rotate(random(-2, 2))
        }
        this.vel.add(this.acc).mult(0.95)
        this.pos.add(this.vel)
    }

    draw() {
        tint(this.col[0], this.col[1], this.col[2])
        image(img, this.pos.x, this.pos.y, this.size, this.size)
    }
}


let ribbonHeads = []

function setup() {
    createCanvas(600, 600)
    frameRate(200)
    imageMode(CENTER)
    fill(0)
    rect(0, 0, width, height)
}

function draw() {
    blendMode(DIFFERENCE)
    fill(1)
    rect(0, 0, width, height)

    blendMode(BLEND)

    if (Math.floor(random(1, 3)) == 1) {
        ribbonHeads.push(new RibbonHead(p5.Vector.random2D().setMag(600).add(createVector(300, 300)), createVector(random(-3, 3), random(-3, 3)), createVector(random(-0.1, 0.1), random(-0.1, 0.1))))
    }

    for (let i = 0; i < ribbonHeads.length; i++) {
        ribbonHeads[i].update()
        ribbonHeads[i].draw()
    }

    // removing ones that wont be seen anymore
    for (let i = ribbonHeads.length - 1; i >= 0; i--) {
        const r = ribbonHeads[i]
        if (
            (r.pos.x < -30 && r.vel.x < 0) ||
            (r.pos.x > width + 30 && r.vel.x > 0) ||
            (r.pos.y < -30 && r.vel.y < 0) ||
            (r.pos.y > height + 30 && r.vel.y > 0)
        ) {
            ribbonHeads.splice(i, 1)
        }
    }
}
