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

let imageTransforms = {
    left: {
        translation: [0, 0],
        rotation: 0
    },
    right: {
        translation: [0, 0],
        rotation: 0
    }
}

const SCALE = 0.1

function bothImagesLoaded(imageL, imageR) {
    let mainCanvas = document.getElementById("mainC")
    let mCtx = mainCanvas.getContext("2d")
    if (threeDMode == "cross-eye" || threeDMode == "VR") {
        mainCanvas.width = SCALE * 2 * Math.min(imageL.width, imageR.width)
        mainCanvas.height = SCALE * Math.min(imageL.height, imageR.height)

        // the image for the left eye
        let leftCanvas = document.getElementById("leftC")
        lCtx = leftCanvas.getContext("2d")
        leftCanvas.width = mainCanvas.width / 2
        leftCanvas.height = mainCanvas.height

        leftCanvas.addEventListener("click", function (event) {
            const boundingRect = leftCanvas.getBoundingClientRect()
            const clickPosX = event.clientX - boundingRect.left
            const clickPosY = event.clientY - boundingRect.top

            imageTransforms.left.translation = [
                leftCanvas.width / 2 - clickPosX,
                leftCanvas.height / 2 - clickPosY
            ]

            drawOverlayImage(
                { canvas: leftCanvas, image: imageL },
                { canvas: rightCanvas, image: imageR }
            )
        })

        lCtx.drawImage(imageL, 0, 0, leftCanvas.width, leftCanvas.height)

        // the image for the right eye
        let rightCanvas = document.getElementById("rightC")
        rCtx = rightCanvas.getContext("2d")
        rightCanvas.width = mainCanvas.width / 2
        rightCanvas.height = mainCanvas.height

        rightCanvas.addEventListener("click", function (event) {
            const boundingRect = rightCanvas.getBoundingClientRect()
            const clickPosX = event.clientX - boundingRect.left
            const clickPosY = event.clientY - boundingRect.top

            imageTransforms.right.translation = [
                rightCanvas.width / 2 - clickPosX,
                rightCanvas.height / 2 - clickPosY
            ]

            drawOverlayImage(
                { canvas: leftCanvas, image: imageL },
                { canvas: rightCanvas, image: imageR }
            )
        })

        rCtx.drawImage(imageR, 0, 0, rightCanvas.width, rightCanvas.height)
    }
    else if (threeDMode == "cyanRed") {
        mainCanvas.width = SCALE * Math.min(imageL.width, imageR.width)
        mainCanvas.height = SCALE * Math.min(imageL.height, imageR.height)

        // the image for the left eye
        let leftCanvas = document.createElement("canvas")
        lCtx = leftCanvas.getContext("2d")
        leftCanvas.width = mainCanvas.width
        leftCanvas.height = mainCanvas.height
        document.body.append(leftCanvas)

        lCtx.drawImage(imageL, 0, 0, leftCanvas.width, leftCanvas.height)
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
        rCtx.drawImage(imageR, 0, 0, rightCanvas.width, rightCanvas.height)
        rCtx.globalCompositeOperation = "multiply"
        rCtx.fillStyle = "red"
        rCtx.fillRect(0, 0, rightCanvas.width, rightCanvas.height)

        mCtx.drawImage(leftCanvas, 0, 0, mainCanvas.width, mainCanvas.height)
        mCtx.globalCompositeOperation = "lighter"
        mCtx.drawImage(rightCanvas, 0, 0, mainCanvas.width, mainCanvas.height)
    }
}

threeDMode = "cross-eye"

function drawOverlayImage(left, right) {
    if (threeDMode == "cross-eye" || threeDMode == "VR") {
        const overlayCanvas = document.getElementById("overlayC")
        const oCtx = overlayCanvas.getContext("2d")
        overlayCanvas.width = left.canvas.width //should be same as right width
        overlayCanvas.height = left.canvas.height

        const averageTranslation = [
            (imageTransforms.left.translation[0] + imageTransforms.right.translation[0]) / 2,
            (imageTransforms.left.translation[1] + imageTransforms.right.translation[1]) / 2
        ]

        oCtx.translate(
            imageTransforms.left.translation[0] - averageTranslation[0],
            imageTransforms.left.translation[1] - averageTranslation[1]
        )
        oCtx.drawImage(left.image, 0, 0, left.canvas.width, left.canvas.height)

        oCtx.globalAlpha = 0.5
        oCtx.resetTransform()

        oCtx.translate(
            imageTransforms.right.translation[0] - averageTranslation[0],
            imageTransforms.right.translation[1] - averageTranslation[1]
        )
        oCtx.drawImage(right.image, 0, 0, right.canvas.width, right.canvas.height)

        const mainCanvas = document.getElementById("mainC")
        const mCtx = mainCanvas.getContext("2d")

        mCtx.fillStyle = "black"
        mCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height)

        if (threeDMode == "cross-eye") {
            mCtx.drawImage(
                right.image,
                imageTransforms.right.translation[0] - averageTranslation[0],
                imageTransforms.right.translation[1] - averageTranslation[1],
                right.canvas.width,
                right.canvas.height
            )
            mCtx.drawImage(
                left.image,
                mainCanvas.width / 2 + imageTransforms.left.translation[0] - averageTranslation[0],
                imageTransforms.left.translation[1] - averageTranslation[1],
                left.canvas.width,
                left.canvas.height
            )
        } else if (threeDMode == "VR") {
            mCtx.drawImage(
                left.image,
                imageTransforms.left.translation[0] - averageTranslation[0],
                imageTransforms.left.translation[1] - averageTranslation[1],
                left.canvas.width,
                left.canvas.height
            )
            mCtx.drawImage(
                right.image,
                mainCanvas.width / 2 + imageTransforms.right.translation[0] - averageTranslation[0],
                imageTransforms.right.translation[1] - averageTranslation[1],
                right.canvas.width,
                right.canvas.height
            )
        }
    }
}