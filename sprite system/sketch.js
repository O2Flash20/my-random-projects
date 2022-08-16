let img1
let img2

let sprites = []

function preload() {
    img1 = loadImage("mogus.png")
    img2 = loadImage("smile.png")
}

function setup() {
    createCanvas(1920, 1080)

    sprites.push(new Sprite(createVector(1, 1), img1, 100, 100))
    sprites.push(new Sprite(createVector(1000, 500), img2, 400, 400))

    noSmooth()
}

function draw() {
    sprites[0].pos.x = mouseX
    sprites[0].pos.y = mouseY

    if (sprites[0].pixelCollision(sprites[1], 10)) {
        background(255)
    } else {
        background(51)
    }
    // if (sprites[0].circleCollision(sprites[1], 50, 200)) {
    //     background(255)
    // } else {
    //     background(51)
    // }
    // if (sprites[0].rectCollision(sprites[1])) {
    //     background(255)
    // } else {
    //     background(51)
    // }

    for (sprite of sprites) {
        sprite.draw()
    }
}
