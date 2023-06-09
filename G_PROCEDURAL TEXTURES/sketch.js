let BuffersSize = 300

let Shaders = {}
let Buffers = {}

let Layers = {}

let Maps = {}
const MapsList = [
    "Albedo", "Normal", "Roughness", "Metalness",
    "Specular", "Height", "Opacity", "Ambient occlusion",
    "Refraction", "Emissive"
]

// effect AND layer types, this was before I made a distinction
const Effects = ["cells", "voronoi", "smoothNoise", "blur", "threshold", "invert", "merge"]

function preload() {
    for (const effect of Effects) {
        Shaders[effect] = loadShader("basic.vert", "Shaders/" + effect + ".frag")
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

function clearGeneration() {
    for (const layer in Layers) {
        Layers[layer].remove()
        document.getElementById("for" + layer).remove()
        delete Layers[layer]
    }
    for (const map in Maps) {
        Maps[map].remove()
        document.getElementById("for" + map).remove()
        delete Maps[map]
    }
}

function changeBufferSizes(size) {
    BuffersSize = size
    for (const buffer in Buffers) {
        Buffers[buffer].resizeCanvas(size, size)
    }
    resizeCanvas(size, size)
}

function renderAndSwitch(effect, Layer) {
    Buffers[effect].shader(Shaders[effect])
    Buffers[effect].rect()
    Layer.image(Buffers[effect].get(), 0, 0)
}

function cells(Layer, numberOfPoints, exposure, seed) {
    Shaders.cells.setUniform("uNumberOfPoints", numberOfPoints)
    Shaders.cells.setUniform("uExposure", exposure)
    Shaders.cells.setUniform("uSeed", seed)

    renderAndSwitch("cells", Layer)
}

function voronoi(Layer, numberOfPoints, seed) {
    Shaders.voronoi.setUniform("uNumberOfPoints", numberOfPoints)
    Shaders.voronoi.setUniform("uSeed", seed)

    renderAndSwitch("voronoi", Layer)
}

function smoothNoise(Layer, detail, seed) {
    Shaders.smoothNoise.setUniform("uDetail", detail)
    Shaders.smoothNoise.setUniform("uSeed", seed)

    renderAndSwitch("smoothNoise", Layer)
}

// amount: 0-1
function blur(Layer, amount) {
    Shaders.blur.setUniform("uLayer", Layer)
    Shaders.blur.setUniform("uAmount", amount)

    renderAndSwitch("blur", Layer)
}

function threshold(Layer, cutoff) {
    Shaders.threshold.setUniform("uLayer", Layer)
    Shaders.threshold.setUniform("uCutoff", cutoff)

    renderAndSwitch("threshold", Layer)
}

function invert(Layer) {
    Shaders.invert.setUniform("uLayer", Layer)

    renderAndSwitch("invert", Layer)
}

// bad idea to only have it merge 2 at a time on the gpu? I'll find out.
function merge(MergeType, MergeDestination, Layers) {
    const nameToNum = ["additive", "others 🙂"]
    Shaders.merge.setUniform("uType", nameToNum.indexOf(MergeType))

    // kick it off with the first two
    Shaders.merge.setUniform("uLayer1", Layers[0])
    Shaders.merge.setUniform("uLayer2", Layers[1])
    Buffers.merge.shader(Shaders.merge)
    Buffers.merge.rect()
    MergeDestination.image(Buffers.merge.get(), 0, 0)
    //

    for (let i = 2; i < Layers.length; i++) {
        Shaders.merge.setUniform("uLayer1", MergeDestination)
        Shaders.merge.setUniform("uLayer2", Layers[i])

        Buffers.merge.shader(Shaders.merge)
        Buffers.merge.rect()
        MergeDestination.image(Buffers.merge.get(), 0, 0)
    }
}

function addToMap(Map, layers) {
    if (layers.length > 1) {
        let layerCanvases = []
        for (let layer of layers) {
            layerCanvases.push(Layers[layer])
        }
        merge("additive", Map, layerCanvases) //?keep additive type?
    } else {
        Map.image(Layers[layers[0]], 0, 0)
    }
}

/*
Maps system for the different parts of a PBR material
    Albedo and Emissive get a mapColor function to give them RGB

gui -> Mat object -> code -> interpreter -> gpu

!at really high resolutions, things seem to be put onto non-WEBGL canvases with their center at the bottom right corner

*contrast effect
*posterize effect

types of map to include:
    Albedo
    *Normal
    Roughness
    Metalness
    Specular
    Height
    Opacity
    *Ambient occlusion
    Refraction
    Emissive

* -> auto-generate
*/