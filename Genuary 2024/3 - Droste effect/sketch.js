let img
function preload() {
    img = loadImage("drawing.png")
}

function setup() {
    createCanvas(957, 674)
    imageMode(CENTER)
}

let t = 0
function draw() {
    background(51)
    t += deltaTime / 1000
    if (t > 36) { t = 0 } // have it restart when it gets too jittery

    translate(478.5, 337)
    translate(-86.0031266888, -55.4114104841) //at infinite smaller images, the smallest will be centered at about this value
    scale((t / 5) ** 7.4765 + 1)
    translate(86.0031266888, 55.4114104841)

    image(img, 0, 0, 957, 674)

    let lastX = 0
    let lastY = 0
    for (let i = 0; i < 15; i++) { //only 15, but it wont get that far
        lastX = 74.5 / (7.4765 ** i) + lastX
        lastY = 48 / (7.4765 ** i) + lastY
        image(img, -lastX, -lastY, 128 / (7.4765 ** i), 90 / (7.4765 ** i))
    }
}