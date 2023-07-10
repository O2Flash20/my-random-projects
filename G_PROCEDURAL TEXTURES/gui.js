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
    addLayer(type) { this.layers.push(new Layer(type)) }

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

    addLayer(type) { this.layers.push(new Layer(type)) }
    setName(name) { this.name = name }
    setType(type) { this.type = type }
}

const LayerTypes = {
    cells: ["numberOfPoints", "exposure", "seed"],
    voronoi: ["numberOfPoints", "seed"],
    noise: ["detail", "seed"]
}
class Layer {
    constructor(type) {
        this.effects = []
        this.type = type
        this.name = null

        for (let param of LayerTypes[type]) {
            this[param] = 1
        }
    }

    addEffect(type) { this.effects.push(new Effect(type)) }
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
    constructor(type) {
        this.type = type

        for (let param of EffectTypes[type]) {
            this[param] = 1
        }
    }

    // setType(type) {
    //     this.type = type
    //     for (let i = 0; i < EffectTypes[type].length; i++) {
    //         this[EffectTypes[type][i]] = null
    //     }
    // }
    setParameter(parameter, value) {
        this[parameter] = value
    }
}

// Object -> text
function saveMaterial() {
    let numIndents = 0
    //*-------------Helper Functions-------------
    let layerNumber = 0 //in case there is no specified name, give it the number
    function addLayerToOutput(layer) {
        output += "Layer "
        output += (layer.name || layerNumber) + " "
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

    // TODO
    function addIndents(indents) {
        for (let i = 0; i < numIndents; i++) {
            output += "  "
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
    Mat.maps.Albedo.addLayer("cells")
    Mat.maps.Albedo.addMerge()
    Mat.maps.Albedo.layers[1].addLayer("voronoi")
    Mat.maps.Albedo.layers[1].addLayer("cells")

    Mat.maps.Albedo.layers[0].numberOfPoints = 15
    Mat.maps.Albedo.layers[0].exposure = 5
    Mat.maps.Albedo.layers[0].seed = 1

    Mat.maps.Albedo.layers[1].setType("additive")

    Mat.maps.Albedo.layers[1].layers[0].numberOfPoints = 10
    Mat.maps.Albedo.layers[1].layers[0].seed = 2

    Mat.maps.Albedo.layers[1].layers[0].addEffect("blur")
    Mat.maps.Albedo.layers[1].layers[0].effects[0].setParameter("amount", "0.1")

    Mat.maps.Albedo.layers[1].layers[1].numberOfPoints = 7
    Mat.maps.Albedo.layers[1].layers[1].exposure = 5
    Mat.maps.Albedo.layers[1].layers[1].seed = 8

    Mat.maps.Albedo.layers[1].layers[1].addEffect("invert")


    Mat.addMap("Height")
    Mat.maps.Height.addLayer("noise")
    Mat.maps.Height.addLayer("cells")

    Mat.maps.Height.layers[0].detail = 10
    Mat.maps.Height.layers[0].seed = 1

    Mat.maps.Height.layers[1].numberOfPoints = 10
    Mat.maps.Height.layers[1].exposure = 10
    Mat.maps.Height.layers[1].seed = 1

    Mat.maps.Height.layers[1].addEffect("blur")
    Mat.maps.Height.layers[1].effects[0].setParameter("amount", "0.1")
    // Mat.maps.Height.layers[1].effects[0].setType("invert")
}

// *erase all and rewrite the html
// *go through the entire object and create elements inputs
// *add functions to switch layers between merges, switch their orders, etc
// object <-> gui
let thisGUILayerId = 0 //used to identify layers when deleting/moving them with the gui
let thisGUIEffectId = 0 //same but for effects
function updateGUI() {
    function removeLayerByID(id, parent) { //works for effects too
        for (let i = 0; i < parent.length; i++) {
            if (parent[i].id == id) {
                parent.splice(i, 1)
                break
            }
        }
    }

    function drawMergeGUI(merge) {

    }
    function drawLayerGUI(layer, parent) {
        const div = createElm("div", holder)

        // ! only if it's not the first layer
        let upButton = createElm("button", div)
        upButton.innerText = "⬆️"

        let deleteButton = createElm("button", div)
        deleteButton.innerText = "-"
        deleteButton.addEventListener("click", (event) => {
            removeLayerByID(layer.id, parent)
            saveAndRenderMaterial()
        })

        let type = createElm("span", div)
        type.innerText = layer.type + " "
        type.style = "font-size:25px"

        let nameInL = createElm("label", div)
        nameInL.innerText = "Name:"

        let nameIn = createElm("input", div)
        nameIn.value = layer.name
        nameIn.addEventListener("change", (event) => {
            layer.name = event.target.value
            saveAndRenderMaterial()
        })

        // parameters
        for (let i = 0; i < LayerTypes[layer.type].length; i++) {
            const param = LayerTypes[layer.type][i]
            let paramInL = createElm("label", div)
            paramInL.innerText = param + ": "
            let paramIn = createElm('input', div)
            paramIn.value = layer[param]
            paramIn.type = "number"
            paramIn.min = "1"
            paramIn.addEventListener("change", (event) => {
                layer[param] = event.target.value
                saveAndRenderMaterial()
            })
        }

        createElm("br", div)

        // ! only if it's not the last layer
        let downButton = createElm("button", div)
        downButton.innerText = "⬇️"

        // add effects
        let newEffect = createElm("select", div)
        for (let effect in EffectTypes) {
            let thisOption = createElm("option", newEffect)
            thisOption.innerText = effect
        }
        let newEffectL = createElm("button", div)
        newEffectL.innerText = "Create Effect"
        newEffectL.addEventListener("click", (event) => {
            layer.addEffect(newEffect.value)
            layer.effects[layer.effects.length - 1].id = thisGUIEffectId; thisGUIEffectId++
            saveAndRenderMaterial()
        })

        // effects
        for (let effect of layer.effects) {
            createElm("br", div)

            let deleteButton = createElm("button", div)
            deleteButton.innerText = "-"
            deleteButton.addEventListener("click", (event) => {
                removeLayerByID(effect.id, layer.effects)
                saveAndRenderMaterial()
            })

            let typeL = createElm("span", div)
            typeL.innerText = effect.type + " "

            // parameters
            for (let parameter of EffectTypes[effect.type]) {
                let paramTypeL = createElm("label", div)
                paramTypeL.innerText = parameter + ": "

                let paramIn = createElm("input", div)
                paramIn.value = effect[parameter]
                paramIn.type = "number"
                paramIn.step = 0.1
                paramIn.min = 0
                paramIn.addEventListener("change", (event) => {
                    effect[parameter] = event.target.value
                    saveAndRenderMaterial()
                })
            }
        }

        // TODO: change order of layers, change order of effects
    }

    let holder = document.getElementById("guiHolder")
    holder.innerHTML = ""

    //*----------------------------------------------
    let sizeInL = createElm("label", holder, "forSizeIn")
    sizeInL.innerText = "Size:"

    let sizeIn = createElm("input", holder, "sizeIn")
    sizeIn.value = Mat.size
    sizeIn.type = "number"
    sizeIn.min = "1"
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

        // delete button
        let mapDelete = createElm("button", holder, map + "Delete")
        mapDelete.innerText = "-"
        mapDelete.for = map
        mapDelete.addEventListener("click", (event) => {
            delete Mat.maps[mapDelete.for]
            saveAndRenderMaterial()
        })

        // creating a new layer
        let newLayer = createElm("select", holder)
        for (let layerType in LayerTypes) {
            let thisOption = createElm("option", newLayer)
            thisOption.innerText = layerType
        }
        let newLayerInL = createElm("button", holder, map + "AddLayer")
        newLayerInL.innerText = "Create Layer"
        newLayerInL.addEventListener("click", (event) => {
            Mat.maps[map].addLayer(newLayer.value)
            Mat.maps[map].layers[Mat.maps[map].layers.length - 1].id = thisGUILayerId; thisGUILayerId++ //give it the id
            saveAndRenderMaterial()
        })

        // drawing the layers inside
        for (let layer of Mat.maps[map].layers) {
            if (Layer.prototype.isPrototypeOf(layer)) {
                drawLayerGUI(layer, Mat.maps[map].layers) //big function here
                createElm("br", holder)
            }
        }

        createElm("br", holder)
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