function loadImages() {
    let fileL = document.getElementById("iL").files[0]
    let fileR = document.getElementById("iR").files[0]

    let loadFile = (file) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader()
            reader.onload = function (e) {
                resolve(loadImage(e.target.result))
            }
            reader.onerror = function (e) {
                reject(new Error("Error reading file"))
            }
            reader.readAsDataURL(file)
        })
    }

    Promise.all([loadFile(fileL), loadFile(fileR)]).then(([imageL, imageR]) => {
        bothImagesLoaded(imageL, imageR)
    }).catch(error => {
        console.error("Error loading images: ", error)
    })
}

function loadImage(dataUrl) {
    let img = new Image()
    img.src = dataUrl
    return img
}

function bothImagesLoaded(imageL, imageR) {
    let mainCanvas = document.getElementById("mainC")
    let mCtx = mainCanvas.getContext("2d")
    if (threeDMode == "cross-eye") {
        mainCanvas.width = 2 * Math.min(imageL.width, imageR.width)
        mainCanvas.height = Math.min(imageL.height, imageR.height)

        mCtx.drawImage(imageR, 0, 0)
        mCtx.drawImage(imageL, mainCanvas.width / 2, 0)
    }
    else if (threeDMode == "cyanRed") {
        mainCanvas.width = Math.min(imageL.width, imageR.width)
        mainCanvas.height = Math.min(imageL.height, imageR.height)

        // the image for the left eye
        let leftCanvas = document.createElement("canvas")
        lCtx = leftCanvas.getContext("2d")
        leftCanvas.width = mainCanvas.width
        leftCanvas.height = mainCanvas.height
        document.body.append(leftCanvas)

        lCtx.drawImage(imageL, 0, 0)
        lCtx.globalCompositeOperation = "multiply"
        lCtx.fillStyle = "cyan"
        lCtx.fillRect(0, 0, leftCanvas.width, leftCanvas.height)

        // the image for the right eye
        let rightCanvas = document.createElement("canvas")
        rCtx = rightCanvas.getContext("2d")
        rightCanvas.width = mainCanvas.width
        rightCanvas.height = mainCanvas.height
        document.body.append(rightCanvas)

        // put the two together
        rCtx.drawImage(imageR, 0, 0)
        rCtx.globalCompositeOperation = "multiply"
        rCtx.fillStyle = "red"
        rCtx.fillRect(0, 0, rightCanvas.width, rightCanvas.height)

        mCtx.drawImage(leftCanvas, 0, 0)
        mCtx.globalCompositeOperation = "lighter"
        mCtx.drawImage(rightCanvas, 0, 0)
    }
}

threeDMode = "cyanRed"