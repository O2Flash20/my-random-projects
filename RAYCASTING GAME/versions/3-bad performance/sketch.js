let walls = []
let ray
let particle

let sky

let textures

function preload() {
    among = loadImage("assets/amogs.png")
    img = loadImage('assets/tile.png')

    // textures = {
    //     among: "assets/amogs.png",
    //     img: 'assets/tile.png'
    // }

    textures = ["assets/amogs.png", 'assets/tile.png']
    texturesIMG = [loadImage("assets/amogs.png"), loadImage("assets/tile.png")]
}

const sceneW = 1920
const sceneH = 1080

let entityTest

function setup() {
    frameRate(60)
    createCanvas(1920, 1080)

    entityTest = new Entity(300, 300, 50, null)
    const line = entityTest.getLine(0, 0)
    walls.push(new Boundary(line[0].x, line[0].y, line[1].x, line[1].y, 1))

    for (let i = 0; i < 1; i++) {
        let x1 = random(sceneW * 10)
        let y1 = random(sceneH * 10)
        let x2 = random(sceneW * 10)
        let y2 = random(sceneH * 10)
        walls[i] = new Boundary(x1, y1, x2, y2, 1)
    }

    // walls.push(new Boundary(0, 0, sceneW, 0, color(200, 51, 7)))
    // walls.push(new Boundary(sceneW, 0, sceneW, sceneH, color(200, 51, 7)))
    // walls.push(new Boundary(sceneW, sceneH, 0, sceneH, color(200, 51, 7)))
    // walls.push(new Boundary(0, sceneH, 0, 0, color(200, 51, 7)))

    // walls.push(new Boundary(-1000, 1000, 0, 1000, color(255)))
    // walls.push(new Boundary(0, 0, 100, 0, color(255, 100, 0)))
    // walls.push(new Boundary(0, 0, 0, 100, color(255, 255, 0)))
    // walls.push(new Boundary(0, 100, 100, 100, color(255, 0, 255)))
    // walls.push(new Boundary(100, 0, 100, 100, color(255, 0, 255)))

    walls.push(new Boundary(1, 2, 3, 500, 1))

    particle = new Particle()

    sky = color(120, 167, 255)
}

function draw() {
    // temp
    const line = entityTest.getLine(particle.pos.x, particle.pos.y)
    walls[0] = new Boundary(line[0].x, line[0].y, line[1].x, line[1].y, 1)
    // ------------------------------------------------------------------------

    if (keyIsDown(37)) {
        particle.rotate(-0.05)
    } else if (keyIsDown(39)) {
        particle.rotate(0.05)
    }
    if (keyIsDown(87)) {
        if (keyIsDown(16)) {
            particle.move(10)
        }
        particle.move(10)
    }
    if (keyIsDown(83)) {
        particle.move(-10)
    }
    if (keyIsDown(65)) {
        particle.strafe(-5)
    }
    if (keyIsDown(68)) {
        particle.strafe(5)
    }

    background(0)

    fill(51, 51, 51)
    rectMode(CORNER)
    rect(0, sceneH / 2, sceneW, sceneH)
    fill(sky)
    rectMode(CORNER)
    rect(0, 0, sceneW, sceneH / 2)

    // for (let wall of walls) {
    //     wall.show();
    // }
    // particle.show();

    distProjPlane = sceneW / 2.0 / tan(particle.fov / 2.0)
    const scene = particle.look(walls)
    const w = sceneW / scene.length

    push()
    translate(sceneW, 0)
    for (let i = 0; i < scene.length; i++) {
        if (scene[i]) {
            noStroke()

            const dist = scene[i][0]

            console.log(scene[i])
            const texture = texturesIMG[scene[i][1][1]].get(scene[i][1][0], 0, 1, texturesIMG[scene[i][1][1]].height)

            const sq = dist * dist
            const wSq = sceneW * sceneW

            const b = map(sq, 0, wSq, 1, 0.5)   // maybe not right?
            const h = (sceneW / dist) * distProjPlane

            // fill(wallColor.levels[0] * b + (1 - b) * sky.levels[0], wallColor.levels[1] * b + (1 - b) * sky.levels[1], wallColor.levels[2] * b + (1 - b) * sky.levels[2])
            fill(255, 255, 255)
            // fill(wallColor.levels[0], wallColor.levels[1], wallColor.levels[2])
            rectMode(CENTER)
            // rect((i * w + w / 2) - sceneW, sceneH / 2, w + 1, h)
            imageMode(CENTER)
            noSmooth()
            if (texture) {
                image(texture, (i * w + w / 2) - sceneW, sceneH / 2, w + 2, h)
            }
        }
    }
    pop()

    // image(img, 500, 10, 128, 128);
    // image(walls[0].getTextureColumn(3), 0, 0, 100, 100)

    // console.log(particle.pos.x + " " + particle.pos.y);
    console.log(getFrameRate())
}