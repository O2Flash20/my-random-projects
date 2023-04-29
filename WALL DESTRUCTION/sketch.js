let Particles = []
let Bullets = []

let Structure = [...Array(192)].map(e => Array(108).fill(null))
let mapImg

let particlesImg

let player

let c

function preload() {
    mapImg = loadImage("assets/testLevel.png")
}

function setup() {
    createCanvas(1920, 1080)
    noSmooth()

    c = createGraphics(192, 108)
    c.noSmooth()
    c.noStroke()

    particlesImg = createImage(192, 108)

    player = new Player(createVector(130, 60), createVector(6, 20))

    // load map in
    for (let x = 0; x < 192; x++) {
        for (let y = 0; y < 108; y++) {
            const col = mapImg.get(x, y)

            if (col[3] > 0) {
                Structure[x][y] = col
            }
        }
    }

    frameRate(60)

    // remove interpolation on the image for a nice pixel art look
    const context = document.getElementById("defaultCanvas0").getContext("2d")
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.msImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false
}

function draw() {
    c.background(14)

    c.image(mapImg, 0, 0)

    particlesImg.loadPixels()
    for (let i = 0; i < Particles.length; i++) {
        let particle = Particles[i]
        particle.applyForce(createVector(0, 0.1))
        particle.update()

        // draw to particles image "buffer"
        particlesImg.set(particle.pos.x - particle.vel.x, particle.pos.y - particle.vel.y, color(0, 0))
        particlesImg.set(particle.pos.x, particle.pos.y, particle.color)

        if (particle.life > 750) { Particles.splice(i, 1) }
    }
    particlesImg.updatePixels()
    c.image(particlesImg, 0, 0)

    while (Particles.length > 1000) {
        Particles.splice(0, 1)
    }

    for (let i = 0; i < Bullets.length; i++) {
        let bullet = Bullets[i]
        const collision = bullet.update()
        bullet.draw()

        if (collision) {
            Bullets.splice(i, 1)

            mapImg.loadPixels()
            breakStructure(collision, bullet.radius, bullet.strength, bullet.vel)
            mapImg.updatePixels()
        }

        if (
            bullet.pos.x < 0 ||
            bullet.pos.x > c.width ||
            bullet.pos.y < 0 ||
            bullet.pos.y > c.height
        ) {
            Bullets.splice(i, 1)
        }
    }

    player.applyForce(createVector(0, 0.1))
    player.update()
    player.draw()
    // if (keyIsDown(87)) { player.move(createVector(0, -1)) }
    // if (keyIsDown(83)) { player.move(createVector(0, 1)) }
    // if (keyIsDown(65)) { player.move(createVector(-1, 0)) }
    // if (keyIsDown(68)) { player.move(createVector(1, 0)) }

    if (keyIsDown(87)) { player.applyForce(createVector(0, -0.2)) }
    if (keyIsDown(83)) { player.applyForce(createVector(0, 0.2)) }
    if (keyIsDown(65)) { player.applyForce(createVector(-0.2, 0)) }
    if (keyIsDown(68)) { player.applyForce(createVector(0.2, 0)) }

    c.fill(200)
    c.text(Math.round(frameRate()), 0, 20)

    image(c, 0, 0, 1920, 1080)
}

function mouseClicked() {
    player.shoot(10, 10, 0.2)
}

function breakStructure(pos, radius, strength, hitVel) {
    radius = Math.floor(radius / 2) * 2
    for (let x = -radius; x < radius; x++) {
        for (let y = -radius; y < radius; y++) {
            const pixelPos = pos.copy().add(createVector(x, y))

            // if it exists
            if (Structure[pixelPos.x] && Structure[pixelPos.x][pixelPos.y]) {

                const distFromHit = dist(0, 0, x, y)
                if (distFromHit < radius) {
                    // and it is in the radius

                    const particleVel = createVector(x, y).add(createVector(Math.random(), Math.random())).mult((radius ** 2 - distFromHit) / radius ** 2 * strength)
                    const forwardAmount = hitVel.copy().normalize().dot(particleVel.copy().normalize())

                    const col = Structure[x + pos.x][y + pos.y]
                    // for (let i = 0; i < 4; i++) { col[i] -= 100 }

                    Particles.push(new Particle(
                        createVector(x, y).add(pos),
                        particleVel.copy().add(particleVel.mult(Math.max(forwardAmount, -0.6) * 2)),
                        "bounce",
                        0.1,
                        "rect",
                        col
                        // color(Structure[x + pos.x][y + pos.y])
                        // color(255, 0, 0)
                    ))

                    removePixelFromStructure(pixelPos.x, pixelPos.y)
                }

            }
        }
    }
}

// need to loadPixels() before and updatePixels() after
function removePixelFromStructure(x, y) {
    if (!Structure[x] || !Structure[x][y]) { return }
    Structure[x][y] = null
    mapImg.set(x, y, color(0, 0))
}


// octree?
// do substeps on the bullet so that it always hits things, even when fast

/*
Collisions:

*/

// save particles previous pos