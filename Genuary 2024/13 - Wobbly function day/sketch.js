let wobbler
let normaler
let colorer
let rocksTexture
function preload() {
    pixelDensity(1)
    wobbler = loadShader("basic.vert", "wobbler.frag")
    normaler = loadShader("basic.vert", "normaler.frag")
    colorer = loadShader("basic.vert", "colorer.frag")

    rocksTexture = loadImage("rocks.jpeg")
}

let c1
let c2
function setup() {
    createCanvas(800, 800, WEBGL)
    createP("Image of the rocks is from Bing Image Creator.")
    c1 = createGraphics(width, height, WEBGL)
    createP("^Height map, generated by a wobbly function.^")
    c2 = createGraphics(width, height, WEBGL)
    createP("^Normal map, used to fake water refraction, generated with the height map (I didn't to it right lol).^")
}

let t = 0
function draw() {
    t += deltaTime / 1000

    wobbler.setUniform("uTime", t)
    c1.shader(wobbler)
    c1.rect(0, 0, width, height)

    normaler.setUniform("uHeightMap", c1)
    normaler.setUniform("uRes", [width, height])
    c2.shader(normaler)
    c2.rect(0, 0, width, height)

    colorer.setUniform("uRes", [width, height])
    colorer.setUniform("uHeight", c1)
    colorer.setUniform("uNormal", c2)
    colorer.setUniform("uRocks", rocksTexture)
    shader(colorer)
    rect(0, 0, width, height)
}
