let BuffersSize = 300

let Shaders = {}
let Buffers = {}

let Layers = {}

const Effects = ["cells", "voronoi", "smoothNoise", "blur", "threshold", "invert", "merge"]

function preload() {
    for (const effect of Effects) {
        Shaders[effect] = loadShader("basic.vert", effect + ".frag")
        Buffers[effect] = createGraphics(BuffersSize, BuffersSize, WEBGL)
    }
}

function setup() {
    createCanvas(BuffersSize, BuffersSize)

    // needed for the shader stuff to work properly
    for (const effect of Effects) {
        Buffers[effect].shader(Shaders[effect])
    }
}

function draw() {
    background(51)
    noLoop()
}

function changeBufferSizes(size) {
    BuffersSize = size
    for (const buffer in Buffers) {
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

function voronoi(Layer, numberOfPoints, seed) {
    Shaders.voronoi.setUniform("uNumberOfPoints", numberOfPoints)
    Shaders.voronoi.setUniform("uSeed", seed)

    Buffers.voronoi.shader(Shaders.voronoi)
    Buffers.voronoi.rect()

    Layer.image(Buffers.voronoi.get(), 0, 0)
}

function smoothNoise(Layer) {
    console.log(Layer)
    Buffers.smoothNoise.shader(Shaders.smoothNoise)
    Buffers.smoothNoise.rect()

    Layer.image(Buffers.smoothNoise.get(), 0, 0)
}

// amount: 0-1
function blur(Layer, amount) {
    Shaders.blur.setUniform("uLayer", Layer)
    Shaders.blur.setUniform("uAmount", amount)

    Buffers.blur.shader(Shaders.blur)
    Buffers.blur.rect()

    Layer.image(Buffers.blur.get(), 0, 0)
}

function threshold(Layer, cutoff) {
    Shaders.threshold.setUniform("uLayer", Layer)
    Shaders.threshold.setUniform("uCutoff", cutoff)

    Buffers.threshold.shader(Shaders.threshold)
    Buffers.threshold.rect()

    Layer.image(Buffers.threshold.get(), 0, 0)
}

function invert(Layer) {
    Shaders.invert.setUniform("uLayer", Layer)
    Buffers.invert.shader(Shaders.invert)
    Buffers.invert.rect()
    Layer.image(Buffers.invert.get(), 0, 0)
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
    have a way to set the final image (just the top merge?)

?a "render and switch" function that can be used for all effects to clean up the code?

?better name for smoothNoise?
*/