// ? also have a "custom" attribute where you write all the shader code manually

export const Materials = {
    // template: {
    //     color: [0, 255, 255] //"swirl.png"
    //     normal: "textures/tilesNormal.jpg",
    //     normalStrength: 0.1,
    //     roughness: 1,
    //     metallic: 0,
    // },

    empty: {
        color: [100, 100, 255],
        normal: undefined,
        roughness: 0,
        metallic: 0
    },
    rough: {
        color: "textures/swirl.png",
        normal: "textures/tilesNormal.jpg",
        normalStrength: 1,
        roughness: 1,
        metallic: 0,
    },
    shiny: {
        color: [0, 255, 0],
        normal: "textures/tilesNormal.jpg",
        normalStrength: 0.1,
        roughness: "textures/roughnessTest.png",
        metallic: 0.5,
    }
}

export async function compileMaterials(materials, device) {
    function getFilename(input) { //thanks chatgpt :)
        // Use regex to capture the filename part without the extension (.png or .jpg)
        const match = input.match(/\/([^\/]+)\.(png|jpg)$/)
        return match ? match[1] : null
    }

    async function loadTexture(url, device) {
        async function loadImageBitmap(url) {
            const res = await fetch(url)
            const blob = await res.blob()
            return await createImageBitmap(blob, { colorSpaceConversion: "none" })
        }

        const source = await loadImageBitmap(url)
        const texture = device.createTexture({
            label: url,
            format: "rgba8unorm",
            size: [source.width, source.height],
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT
        })

        device.queue.copyExternalImageToTexture(
            { source, flipY: true },
            { texture },
            { width: source.width, height: source.height }
        )

        return texture
    }

    async function textures(device) { //todo: output the code that will go in the wgsl that takes in the textures and the matching bind group entries and the code in wgsl sampling all the textures at uv
        let textures = []

        // getting all of the textures used in all materials
        for (let materialName in materials) {
            const material = materials[materialName]

            for (let propertyName in material) {
                const property = material[propertyName]
                if (typeof (property) == "string") { //this property of this material is a texture link (probably)
                    let textureAlreadyThere = false
                    for (let i = 0; i < textures.length; i++) { if (textures[i][0] == property) { textureAlreadyThere = true; break } }
                    if (!textureAlreadyThere) { textures.push([property, getFilename(property)]) } //*stores both the file path and the file name
                }
            }
        }

        // sets up bind group entries for all the textures that will be used
        let bindGroupEntries = []
        for (let i = 0; i < textures.length; i++) {
            const thisTexture = await loadTexture(textures[i][0], device)
            bindGroupEntries.push({ binding: i + 20, resource: thisTexture.createView() })
        }

        // imports the textures on the gpu
        let importCode = ""
        for (let i = 0; i < textures.length; i++) {
            importCode += `@group(0) @binding(${i + 20}) var ${textures[i][1]}Texture: texture_2d<f32>;\n`
        }

        // samples the textures of the gpu to be used easily
        let sampleCode = ""
        for (let i = 0; i < textures.length; i++) {
            sampleCode += `let ${textures[i][1]} = textureSample(${textures[i][1]}Texture, linearSampler, uv);\n`
        }

        return { bindGroupEntries, importCode, sampleCode }
    }

    function materialCode(material) {
        let code = ""

        // color
        code += "\t"
        if (typeof (material.color) == "object") { //the color is a constant
            code += `output.color = vec4f(${material.color[0] / 255}, ${material.color[1] / 255}, ${material.color[2] / 255}, 1);\n`
        }
        else { //the color comes from a texture, so set it to the sampling of that texture
            const textureVariable = getFilename(material.color)
            code += `output.color = ${textureVariable};\n`
        }

        // normal
        code += "\t"
        if (material.normal !== undefined) {
            const textureVariable = getFilename(material.normal)
            code += /*wgsl*/`
                // let normalModifier = ${textureVariable} * ${material.normalStrength ? material.normalStrength : 1};
                // let 
            `
        }
        else {
            code += "output.normal = vec4f(normal, 0);\n"
        }

        // roughness
        code += "\t"
        if (typeof (material.roughness) == "number") {
            code += `output.roughness = ${material.roughness};\n`
        }
        else {
            const textureVariable = getFilename(material.roughness)
            code += `output.roughness = clamp(length(${textureVariable}.rgb), 0, 1);\n`
        }

        // metallic
        code += "\t"
        if (typeof (material.metallic) == "number") {
            code += `output.metallic = ${material.metallic};\n`
        }
        else {
            const textureVariable = getFilename(material.metallic)
            code += `output.metallic = clamp(length(${textureVariable}.rgb), 0, 1);\n`
        }

        return code
    }

    let textureOutputs = await textures(device)

    let defaultEmptyMaterial = {
        color: [100, 100, 255],
        normal: undefined,
        roughness: 1,
        metallic: 0
    }

    let materialsList = [] //a list to link a material's name to its number
    let materialsCode = `if (material == 0) {\n` + materialCode(materials.empty ? materials.empty : defaultEmptyMaterial) + "}\n"

    let i = 1
    for (let materialName in materials) {
        if (materialName == "empty") { continue }

        const material = materials[materialName]
        materialsList.push([i, materialName])

        materialsCode += `else if (material == ${i}){\n` + materialCode(material) + "}\n"
        i++
    }

    return { bindGroupEntries: textureOutputs.bindGroupEntries, textureImportCode: textureOutputs.importCode, textureSampleCode: textureOutputs.sampleCode, materialsCode, materialsList }
}