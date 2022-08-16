//shorter document.getElementById
function id(id) {
    return document.getElementById(id)
}

//download a zip file under a name
function saveZip(zip, name) {
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            saveAs(content, name)
            document.getElementById("configSave").innerHTML = "Save Config"
        })
}

//returns a zip from URL
async function getZip(URL) {
    let response = await fetch(URL)
    let data = await response.arrayBuffer()

    let zip = new JSZip()
    zip.loadAsync(data)
    return zip
}

//sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

//generate a uuid
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

//create a manifest file
function createManifestContent(name, description, version) {
    return `{
    "format_version": 2,
    "header": {
      "description": "${description}",
      "name": "${name}",
      "uuid":"${uuidv4()}",
      "version": ${version},
      "min_engine_version": [1, 16, 0]
     },
    "modules": [
      {
        "description": "${description}",
        "type": "resources",
        "uuid": "${uuidv4()}",
        "version": ${version}
      }
    ]
   }`
}

//move an item forward or backward in an array
function moveItem(array, index, direction) {
    if (direction == "forward") {
        [array[index], array[index + 1]] = [array[index + 1], array[index]]

    } else if (direction == "backward") {
        [array[index - 1], array[index]] = [array[index], array[index - 1]]
    }
    return array
}

//turns an image URL into base64 I DID NOT MAKE THIS
function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        var reader = new FileReader()
        reader.onloadend = function () {
            callback(reader.result)
        }
        reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
}





//array of modules selected
let modules = []
let modulesNames = []

//combine an array of zips
async function combineZips(zipsArray) {
    let zip = new JSZip()

    for (let i = 0; i < zipsArray.length; i++) {
        let zipTemp = zipsArray[i]
        zipTemp.forEach(async function (relativePath, file) {
            let fileContent = await file.async("base64")
            await sleep(5000)
            zip.file(file.name, fileContent, { base64: true, createFolders: true })
        })
    }

    return zip
}

//add a zip to the queue
async function addModule(id) {
    if (document.getElementById(id).classList.contains("selected")) {
        document.getElementById(id).classList.remove("selected")

        let index = modulesNames.indexOf(mods[id].name)
        console.log(id, index)
        modulesNames.splice(index, 1)
        modules.splice(index, 1)

    } else {
        let module = mods[id]
        modulesNames.push(module.name)
        modules.push(await getZip(module.url))

        document.getElementById(id).classList.add("selected")
    }

    updateSelectedList()
}

//combine the modules array with the base
let title = base.title
let version = base.version
async function loadConfig() {
    document.getElementById("configSave").innerText = "Loading"

    let output = await combineZips(modules)
    console.log("1")
    await sleep(5000 + modules.length * 1000)
    console.log("2")
    let description
    //set the config description
    if (modulesNames.length > 0) {
        description = "Modules: "
    } else {
        description = "No Modules"
    }
    for (let i = 0; i < modulesNames.length; i++) {
        description += `${modulesNames[i]}`
        if (i < modulesNames.length - 1) {
            description += ", "
        }
    }
    description += "\\n" + base.description

    output.file("manifest.json", createManifestContent(title, description, version))

    id("packIconCanvas").toBlob(function (blob) {
        output.file("pack_icon.png", blob)
    })

    await sleep(30)

    saveZip(output, "PythonClient.mcpack")

    document.getElementById("configSave").innerText = "Preparing to download 🕗"
}




//load up the mods list
let categories = []
function loadModules() {
    let modulesCount = 1
    for (let module in mods) {
        let moduleO = mods[module]
        modulesCount++

        if (!categories.includes(moduleO.category)) {
            categories.push(moduleO.category)
            let catElm = document.createElement("div")
            catElm.id = moduleO.category
            let catTitle = document.createElement("p")
            catTitle.innerHTML = moduleO.category
            catTitle.style.fontSize = "30px"
            catTitle.style.padding = "5px"
            catTitle.style.border = "4px solid #F45375"
            catTitle.style.borderRadius = "5px"
            catTitle.style.backgroundColor = "#7CECD6"
            catElm.appendChild(catTitle)
            id("modulesArea").appendChild(catElm)
        } else {
            if (id(moduleO.category).childElementCount > 4) {
                id(moduleO.category).appendChild(document.createElement("br"))
            }
        }

        let div = document.createElement("div")
        div.id = module
        div.classList.add("moduleBox")
        div.onclick = function () { addModule(module) }
        div.style.display = "inline-block"
        document.getElementById(moduleO.category).appendChild(div)

        let nameElm = document.createElement("p")
        nameElm.innerHTML = moduleO.name
        div.appendChild(nameElm)

        let imageElm = document.createElement("img")
        imageElm.src = moduleO.imageURL
        imageElm.style.objectFit = "cover"
        div.appendChild(imageElm)

        let descElm = document.createElement("p")
        descElm.innerHTML = moduleO.description
        div.appendChild(descElm)
    }
}
loadModules()

//update the modules list
function updateSelectedList() {
    let container = document.getElementById("selectedModules")
    container.innerHTML = ""
    for (let i = modulesNames.length; i > 0; i--) {
        let elm = document.createElement("span")
        elm.innerHTML = "-" + modulesNames[i - 1]
        container.appendChild(elm)

        if (i !== 1) {
            let down = document.createElement("span")
            down.innerText = "⬇️"

            down.onclick = function () {
                moveItem(modulesNames, i - 1, "backward")
                moveItem(modules, i - 1, "backward")
                updateSelectedList()
            }

            container.appendChild(down)
        }
        if (i !== modulesNames.length) {
            let up = document.createElement("span")
            up.innerText = "⬆️"

            up.onclick = function () {
                moveItem(modulesNames, i, "backward")
                moveItem(modules, i, "backward")
                updateSelectedList()
            }

            container.appendChild(up)
        }

        container.appendChild(document.createElement("br"))
    }
}

id("logo").src = base.packIcon
id("packIconCanvas").width = id("logo").width
id("packIconCanvas").height = id("logo").height
id("packIconCanvas").getContext("2d").drawImage(id("logo"), 0, 0, id("logo").width, id("logo").height)