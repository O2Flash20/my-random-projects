class Material {
    constructor(size) {
        this.size = size
        this.maps = {}
    }

    addMap(type) {
        const newMap = new Map()
        newMap.type = type
        this.maps[type] = newMap
    }

    // download
}
let Mat = new Material(400)

class Map {
    constructor() {
        this.layers = []
        this.type = null
    }

    addMerge() { this.layers.push(new Merge()) }
    addLayer() { this.layers.push(new Layer()) }

    autoGenerate() {
        if (this.type == "normal") { }
        if (this.type == "ambientOcclusion") { }
    }
}

class Merge {
    constructor() {
        this.layers = []
        this.type = null
        this.name = null
    }

    addLayer() { this.layers.push(new Layer()) }
    setName(name) { this.name = name }
    setType(type) { this.type = type }
}

const LayerTypes = {
    cells: ["numberOfPoints", "exposure", "seed"],
    voronoi: ["numberOfPoints", "seed"],
    noise: ["detail", "seed"]
}
class Layer {
    constructor() {
        this.effects = []
        this.type = null
        this.name = null
    }

    addEffect() { this.effects.push(new Effect) }
    setName(name) { this.name = name }

    setType(type) {
        this.type = type
        for (let i = 0; i < LayerTypes[type].length; i++) {
            this[LayerTypes[type][i]] = null
        }
    }
    setParameter(parameter, value) {
        this[parameter] = value
    }
}

const EffectTypes = {
    blur: ["amount"],
    threshold: ["cutoff"],
    invert: []
}
class Effect {
    constructor() {
        this.type = null
    }

    setType(type) {
        this.type = type
        for (let i = 0; i < EffectTypes[type].length; i++) {
            this[EffectTypes[type][i]] = null
        }
    }
    setParameter(parameter, value) {
        this[parameter] = value
    }
}

function saveMaterial() {
    let a = Mat.maps.albedo
    let output = ""
    let layerNumber = 0

    output += Mat.size + " "

    function addLayerToOutput(layer) {
        output += "Layer "
        output += layer.name || layerNumber + " "
        output += layer.type + " "

        // add in all the parameters
        for (let i = 0; i < LayerTypes[layer.type].length; i++) {
            output += layer[LayerTypes[layer.type][i]] + " "
        }

        // add in all the effects and their parameters
        for (let i = 0; i < layer.effects.length; i++) {
            addEffectToOutput(layer.effects[i])
        }
        layerNumber++
    }
    function addEffectToOutput(effect) {
        output += effect.type + " "
        // add in all the parameters
        for (let i = 0; i < EffectTypes[effect.type].length; i++) {
            output += effect[EffectTypes[effect.type][i]] + " "
        }
    }

    // go over each layer
    for (let i = 0; i < a.layers.length; i++) {
        const layer = a.layers[i]

        // if it's a merge:
        if (Merge.prototype.isPrototypeOf(layer)) {
            // the merge stuff
            const n = layer.name || layerNumber
            output += "Merge " + n + " " + layer.type + " { "
            layerNumber++

            for (let k = 0; k < layer.layers.length; k++) {
                addLayerToOutput(layer.layers[k])
            }

            output += "}"
        }

        // if it's a layer:
        if (Layer.prototype.isPrototypeOf(layer)) {
            addLayerToOutput(layer)
        }
    }

    return output
}

function saveAndRenderMaterial() {
    document.getElementById("input").value = saveMaterial()
    enter()
}

// ? add \n new lines to make it prettier
// ? always add one overall merge in case the user didnt
    // with type additive?

/*
Mat.addMap("albedo")
Mat.maps.albedo.addLayer()
Mat.maps.albedo.addMerge()
Mat.maps.albedo.layers[1].addLayer()
Mat.maps.albedo.layers[1].addLayer()

Mat.maps.albedo.layers[0].setType("cells")
Mat.maps.albedo.layers[0].numberOfPoints = 15
Mat.maps.albedo.layers[0].exposure = 5
Mat.maps.albedo.layers[0].seed = 1

Mat.maps.albedo.layers[1].setType("additive")

Mat.maps.albedo.layers[1].layers[0].setType("voronoi")
Mat.maps.albedo.layers[1].layers[0].numberOfPoints = 10
Mat.maps.albedo.layers[1].layers[0].seed = 2

Mat.maps.albedo.layers[1].layers[1].setType("cells")
Mat.maps.albedo.layers[1].layers[1].numberOfPoints = 7
Mat.maps.albedo.layers[1].layers[1].exposure = 5
Mat.maps.albedo.layers[1].layers[1].seed = 8

Mat.maps.albedo.layers[1].layers[1].addEffect()
Mat.maps.albedo.layers[1].layers[1].effects[0].setType("invert")
*/