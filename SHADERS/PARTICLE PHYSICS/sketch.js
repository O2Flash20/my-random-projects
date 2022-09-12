let physicsShader

let c

function preload() {
    physicsShader = loadShader("pPhysics.vert", "pPhysics.frag")

    c = createGraphics(2, 50, WEBGL)

    c.pixelDensity(1)
}

function setup() {
    createCanvas(400, 400)
}

function draw() {
    background(220)

    physicsShader.setUniform("uRes", [c.width, c.height])
    physicsShader.setUniform("uLastFrame", c)

    c.shader(physicsShader)
    c.rect(1, 1, 1, 1)
}


/*
layer of "compute shader", each particle is its own row, two colors
    1:
        r -> x pos
        g -> y pos
        b -> x vel
    2:
        r -> x pos(2)
        g -> y pos(2)
        b -> y vel

    x and y pos work like base 256 (so there are 256*256 possible combinations)

then cpu goes through all the rows and sets the pixel
*/