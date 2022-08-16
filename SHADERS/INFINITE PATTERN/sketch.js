let tilesShader
let colorShader

// individual tile
let c

// all of the tiles, to color
let t

// the truly random particles
let a

const width = 1920
const height = 1080
const tilesPerRow = 30 //10
const tilesPerColumn = 15 //5

function preload() {
    tilesShader = loadShader("tiles.vert", "tiles.frag")

    colorShader = loadShader("color.vert", "color.frag")
}

let particles = []
let particlesFullR = []
function setup() {
    pixelDensity(1)
    createCanvas(width, height, WEBGL)
    noStroke()

    c = createGraphics(width / tilesPerRow, height / tilesPerColumn)
    c.pixelDensity(1)
    c.noStroke()

    t = createGraphics(width, height, WEBGL)
    t.pixelDensity(1)
    t.noStroke()

    // a = createGraphics(width, height, WEBGL)
    // a.pixelDensity(1)
    // a.noStroke()
    // a.fill(255)

    for (let i = 0; i < 240; i++) {
        particles.push({
            pos: createVector(c.width / 2, c.height / 2),
            vel: randomSphere(0.05, 0.5),
            radius: random(0.1, 0.2),
            hasCopy: false
        })
    }

    // for (let i = 0; i < 2400; i++) {
    //     particlesFullR.push({
    //         pos: createVector(random(width), random(height)),
    //         vel: randomSphere(0.05, 0.5),
    //         radius: 1
    //     })
    // }
}

// drawRand = true
function draw() {
    c.background(0)

    c.fill(255)
    for (i = 0; i < particles.length; i++) {
        p = particles[i]
        c.ellipse(p.pos.x, p.pos.y, p.radius, p.radius)

        p.pos.add(p.vel)

        // clear the ones "off screen"
        if (p.hasCopy) {
            if (p.pos.x < -p.radius) { particles.splice(i, 1) }
            if (p.pos.x > c.width + p.radius) { particles.splice(i, 1) }
            if (p.pos.y < -p.radius) { particles.splice(i, 1) }
            if (p.pos.y > c.height + p.radius) { particles.splice(i, 1) }
        }
        // create a replacement if its starting to go offscreen
        else {
            if (p.pos.x < p.radius && p.vel.x < 0) {
                p.hasCopy = true
                particles.push({
                    pos: createVector(c.width + p.pos.x, p.pos.y),
                    vel: p.vel.copy(),
                    radius: p.radius,
                    hasCopy: false
                })
            }

            if (c.width - p.pos.x < p.radius && p.vel.x > 0) {
                p.hasCopy = true
                particles.push({
                    pos: createVector(-(c.width - p.pos.x), p.pos.y),
                    vel: p.vel.copy(),
                    radius: p.radius,
                    hasCopy: false
                })
            }

            if (p.pos.y < p.radius && p.vel.y < 0) {
                p.hasCopy = true
                particles.push({
                    pos: createVector(p.pos.x, c.height + p.pos.y),
                    vel: p.vel.copy(),
                    radius: p.radius,
                    hasCopy: false
                })
            }

            if (c.height - p.pos.y < p.radius && p.vel.y > 0) {
                p.hasCopy = true
                particles.push({
                    pos: createVector(p.pos.x, -(c.height - p.pos.y)),
                    vel: p.vel.copy(),
                    radius: p.radius,
                    hasCopy: false
                })
            }
        }
    }

    // a.background(0)
    // for (let p of particlesFullR) {
    //     p.pos.add(p.vel)
    //     if (drawRand) {
    //         a.ellipse(p.pos.x - a.width / 2, p.pos.y - a.height / 2, 1, 1)
    //     }
    // }

    // a.rect(40, 40, 200, 100)

    tilesShader.setUniform("uTile", c)
    tilesShader.setUniform("uNumTiles", [tilesPerRow, tilesPerColumn])
    t.shader(tilesShader)
    t.rect(0, 0, width, height)

    colorShader.setUniform("uTime", frameCount)
    colorShader.setUniform("uTex0", t)
    // colorShader.setUniform("uTex1", a)
    shader(colorShader)
    rect(0, 0, width, height)

    fill(300)
    rect(0, 0, 100, 100)
}

function randomSphere(minLen, maxLen) {
    const len = random(minLen, maxLen)
    const angle = random(360)

    const x = len * sin(radians(angle))
    const y = len * cos(radians(angle))

    return createVector(x, y)
}