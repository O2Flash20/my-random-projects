let lavaShader

function preload() {
    lavaShader = loadShader("basic.vert", "lava.frag")
}

function setup() {
    createCanvas(400, 800)
    c = createGraphics(width, height, WEBGL)
    pixelDensity(1)
}

t = 0
function draw() {
    background(220)
    t += deltaTime / 1000

    lavaShader.setUniform("uRes", [width, height])
    lavaShader.setUniform("uTime", t)

    c.shader(lavaShader)
    c.rect(0, 0, width, height)

    image(c, 0, 0, width, height)

    // some funky stuff to give it the appearance of shading
    for (let i = 0; i < 20; i++) {
        c.filter(ERODE)
    }
    c.filter(BLUR, 10)
    tint(255, 127)
    image(c, 0, 0, width, height)
    tint(255)

    filter(BLUR, 1)
}
