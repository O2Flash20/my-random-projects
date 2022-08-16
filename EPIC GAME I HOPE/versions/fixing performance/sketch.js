let walls = []
let entities = []
let particle

let sky

let textures
let textureColumns = []

function preload() {
    // among = loadImage("assets/amogs.png")
    // img = loadImage('assets/tile.png')

    textures = [loadImage("assets/amogs.png"), loadImage("assets/38172b9051ff3a5d9f16354e8398cb1f-1000.jpg"), loadImage("assets/5x10.png"), loadImage("assets/20x10.png"), loadImage("assets/10x10.png"), loadImage("assets/10x10.png"), loadImage("assets/10x1080.png")]
}

const sceneW = 1920
const sceneH = 1080

let entityTest

function setup() {
    frameRate(60)
    createCanvas(1920, 1080)

    // player
    particle = new Particle()

    // generate texture strips
    for (let texture of textures) {
        let strips = []
        for (let i = 0; i < texture.width; i++) {
            strips.push(texture.get(i, 0, 1, texture.height))
        }
        textureColumns.push(strips)
    }

    // entity
    entities.push(new Entity(300, 300, 50, 0))
    entities.push(new Entity(-100, 500, 50, 0))
    for (let i = 0; i < 5; i++) {
        entities.push(new Entity(random(0, 1000), random(0, 1000), 50, 0))
    }

    // random walls
    for (let i = 0; i < 10; i++) {
        let x1 = random(sceneW * 10)
        let y1 = random(sceneH * 10)
        let x2 = random(sceneW * 10)
        let y2 = random(sceneH * 10)
        walls.push(new Boundary(x1, y1, x2, y2, Math.round(random(2, 4))))
    }

    // default wall
    walls.push(new Boundary(1, 2, 3, 500, 5))

    sky = color(120, 167, 255)

}

function draw() {

    for (let entity of entities) {
        entity.update()
    }

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

    // sky and ground
    fill(51, 51, 51)
    rectMode(CORNER)
    rect(0, sceneH / 2, sceneW, sceneH)
    fill(sky)
    rectMode(CORNER)
    rect(0, 0, sceneW, sceneH / 2)

    distProjPlane = sceneW / 2.0 / tan(particle.fov / 2.0)

    const scenes = []
    scenes.push(particle.look(walls))
    for (let entity of entities) {
        scenes.push(particle.look([entity]))
    }

    // const w = sceneW / scene.length
    const w = 1

    push()
    translate(sceneW, 0)

    for (let i = 0; i < 1920; i++) {
        let distances = []
        // get a neat list of all the distances of the different scenes
        for (let j = 0; j < scenes.length; j++) {
            // not include the nulls
            if (scenes[j][i]) {
                // [the distance, what scene it comes from]
                distances.push([scenes[j][i][0], j])
            }
        }

        while (distances.length > 0) {
            // [the distance, the scene it comes from, its index in the distances array]
            let smallestDist = [0, undefined, undefined]
            for (let j = 0; j < distances.length; j++) {
                if (distances[j][0] > smallestDist[0]) {
                    smallestDist = [distances[j][0], distances[j][1], j]
                }
            }
            distances.splice(smallestDist[2], 1)
            renderSlice(scenes[smallestDist[1]], i)
        }
    }
    pop()

}

function getSliceDist(scenes, scene, index) {
    return scenes[scene][index][0]
}

function renderSlice(scene, index) {
    if (scene[index]) {
        const w = 1

        const dist = scene[index][0]

        const texture = textureColumns[scene[index][1][1]][Math.floor(scene[index][1][0] * 1) % textures[scene[index][1][1]].width]

        const sq = dist * dist
        const wSq = sceneW * sceneW

        const b = map(sq, 0, wSq, 1, 0.5)
        const h = (sceneW / dist) * distProjPlane

        imageMode(CENTER)
        noSmooth()
        image(texture, (index * w + w / 2) - sceneW, sceneH / 2, w + 2, h)
    }
}