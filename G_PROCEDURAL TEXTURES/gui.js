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
let Mat = new Material("400")

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

// Object -> text
function saveMaterial() {
    //*-------------Helper Functions-------------
    let layerNumber = 0 //in case there is no specified name, give it the number
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
        output += "\n"
        layerNumber++
    }
    function addEffectToOutput(effect) {
        output += effect.type + " "
        // add in all the parameters
        for (let i = 0; i < EffectTypes[effect.type].length; i++) {
            output += effect[EffectTypes[effect.type][i]] + " "
        }
    }
    //*------------------------------------------

    let output = Mat.size + "\n"

    // loops through each map, adds the Map's bits at the start and end, and fills in the Merges and Layers in the middle
    for (let map in Mat.maps) {

        output += map + " {\n"
        map = Mat.maps[map]

        // go over each layer (Layer or Merge)
        for (let i = 0; i < map.layers.length; i++) {
            const layer = map.layers[i]

            // if it's a merge (includes layers and effects):
            // !!!!! does not work for merges within merges - need some recursive function
            if (Merge.prototype.isPrototypeOf(layer)) {
                // the merge stuff
                const n = layer.name || layerNumber
                output += "Merge " + n + " " + layer.type + " {\n"
                layerNumber++

                for (let k = 0; k < layer.layers.length; k++) {
                    addLayerToOutput(layer.layers[k])
                }

                output += "}\n"
            }

            // if it's a layer (includes effects):
            if (Layer.prototype.isPrototypeOf(layer)) {
                addLayerToOutput(layer)
            }
        }
        output += "}\n" //closing bracket for the map
    }

    return output
}

//TODO loadMaterial() (pain)

function saveAndRenderMaterial() {
    document.getElementById("input").value = saveMaterial()
    enter()
    updateGUI()
}

// *and indents (might be a bit hard)

function matTest() {
    Mat.addMap("Albedo")
    Mat.maps.Albedo.addLayer()
    Mat.maps.Albedo.addMerge()
    Mat.maps.Albedo.layers[1].addLayer()
    Mat.maps.Albedo.layers[1].addLayer()

    Mat.maps.Albedo.layers[0].setType("cells")
    Mat.maps.Albedo.layers[0].numberOfPoints = 15
    Mat.maps.Albedo.layers[0].exposure = 5
    Mat.maps.Albedo.layers[0].seed = 1

    Mat.maps.Albedo.layers[1].setType("additive")

    Mat.maps.Albedo.layers[1].layers[0].setType("voronoi")
    Mat.maps.Albedo.layers[1].layers[0].numberOfPoints = 10
    Mat.maps.Albedo.layers[1].layers[0].seed = 2

    Mat.maps.Albedo.layers[1].layers[1].setType("cells")
    Mat.maps.Albedo.layers[1].layers[1].numberOfPoints = 7
    Mat.maps.Albedo.layers[1].layers[1].exposure = 5
    Mat.maps.Albedo.layers[1].layers[1].seed = 8

    Mat.maps.Albedo.layers[1].layers[1].addEffect()
    Mat.maps.Albedo.layers[1].layers[1].effects[0].setType("invert")


    Mat.addMap("Height")
    Mat.maps.Height.addLayer()
    Mat.maps.Height.addLayer()

    Mat.maps.Height.layers[0].setType("noise")
    Mat.maps.Height.layers[0].detail = 10
    Mat.maps.Height.layers[0].seed = 1

    Mat.maps.Height.layers[1].setType("cells")
    Mat.maps.Height.layers[1].numberOfPoints = 10
    Mat.maps.Height.layers[1].exposure = 10
    Mat.maps.Height.layers[1].seed = 1

    Mat.maps.Height.layers[1].addEffect()
    Mat.maps.Height.layers[1].effects[0].setType("invert")
}

// *erase all and rewrite the html
// *go through the entire object and create elements inputs
// *add functions to switch layers between merges, switch their orders, etc
// object <-> gui
function updateGUI() {
    let holder = document.getElementById("guiHolder")
    holder.innerHTML = ""

    //*----------------------------------------------
    let sizeInL = createElm("label", holder, "forSizeIn")
    sizeInL.innerText = "Size:"

    let sizeIn = createElm("input", holder, "sizeIn")
    sizeIn.value = Mat.size
    sizeIn.addEventListener("change", (event) => {
        Mat.size = event.target.value
        changeBufferSizes(event.target.value)
        saveAndRenderMaterial() //?maybe
    })
    //*----------------------------------------------

    createElm("br", holder)

    //*----------------------------------------------
    let mapsListIn = createElm("select", holder, "mapsListIn")

    let existingMaps = []
    for (let existingMap in Mat.maps) { existingMaps.push(existingMap) }
    // show the map in the list only if it isn't already added
    for (let map of MapsList) {
        if (!existingMaps.includes(map)) {
            let thisOption = createElm("option", mapsListIn, map)
            thisOption.innerText = map
        }
    }

    let newMapIn = createElm("button", holder, "newMapIn")
    newMapIn.innerText = "Add Map"
    newMapIn.addEventListener("click", (event) => {
        Mat.addMap(mapsListIn.value)
        saveAndRenderMaterial()
    })
    //*----------------------------------------------

    createElm("br", holder)

    //*----------------------------------------------
    for (let map in Mat.maps) {
        let mapTitle = createElm("span", holder, map + "Title")
        mapTitle.innerText = map
        mapTitle.classList.add("mapTitle")

        let mapDelete = createElm("button", holder, map + "Delete")
        mapDelete.innerText = "-"
        mapDelete.for = map
        mapDelete.addEventListener("click", (event) => {
            delete Mat.maps[mapDelete.for]
            saveAndRenderMaterial()
        })

        createElm("br", holder)
    }
    //*----------------------------------------------

}
updateGUI()

function createElm(type, parent, id) {
    let elm = document.createElement(type)
    if (id) { elm.id = id }

    parent.appendChild(elm)
    return elm
}