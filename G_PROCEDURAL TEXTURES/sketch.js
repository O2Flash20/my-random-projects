let BuffersSize = 300

let Shaders = {}
let Buffers = {}

let Layers = {}

// let TestLayer1
// let TestLayer2
// let TestMerge

function preload() {
    Shaders.cells = loadShader("basic.vert", "cells.frag")
    Shaders.blur = loadShader("basic.vert", "blur.frag")
    Shaders.merge = loadShader("basic.vert", "merge.frag")
}

function setup() {
    createCanvas(BuffersSize, BuffersSize)

    Buffers.cells = createGraphics(BuffersSize, BuffersSize, WEBGL)
    Buffers.blur = createGraphics(BuffersSize, BuffersSize, WEBGL)
    Buffers.merge = createGraphics(BuffersSize, BuffersSize, WEBGL)

    // TestLayer1 = createGraphics(size, size)
    // TestLayer2 = createGraphics(size, size)
    // TestMerge = createGraphics(size, size)

    inits()
}

function draw() {
    background(51)

    noLoop()
}

function inits() {
    Buffers.cells.shader(Shaders.cells)
    Buffers.blur.shader(Shaders.blur)
    Buffers.merge.shader(Shaders.merge)
}

function changeBufferSizes(size) {
    BuffersSize = size
    for (const buffer in Buffers) {
        // console.log(buffer)
        Buffers[buffer].resizeCanvas(size, size)
    }
    resizeCanvas(size, size)
}

function cells(Layer, numberOfPoints, exposure, seed) {
    Shaders.cells.setUniform("uNumberOfPoints", numberOfPoints)
    Shaders.cells.setUniform("uExposure", exposure)
    Shaders.cells.setUniform("uSeed", seed)

    Buffers.cells.shader(Shaders.cells)
    Buffers.cells.rect()

    Layer.image(Buffers.cells.get(), 0, 0)
}

// amount: 0-1
function blur(Layer, amount) {
    Shaders.blur.setUniform("uLayer", Layer)
    Shaders.blur.setUniform("uAmount", amount)

    Buffers.blur.shader(Shaders.blur)
    Buffers.blur.rect()

    Layer.image(Buffers.blur.get(), 0, 0)
}

function merge(MergeType, MergeDestination, Layer1, Layer2) {
    const nameToNum = ["additive", "others 🙂"]
    Shaders.merge.setUniform("uType", nameToNum.indexOf(MergeType))
    Shaders.merge.setUniform("uLayer1", Layer1)
    Shaders.merge.setUniform("uLayer2", Layer2)

    Buffers.merge.shader(Shaders.merge)
    Buffers.merge.rect()

    MergeDestination.image(Buffers.merge.get(), 0, 0)
}

/*
also need:
    color mapping on individual layers?
    final modifications to the full image
*/