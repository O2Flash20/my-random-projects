let imageTransforms = {
    left: {
        rotation: 0,
        center: [0.5, 0.5]
    },
    right: {
        rotation: 0,
        center: [0.5, 0.5]
    }
}

const SCALE = 0.25

let imageL
let imageR

// called when the user submits the images
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

    Promise.all([loadFile(fileL), loadFile(fileR)]).then(([imageLeft, imageRight]) => {
        imageL = imageLeft
        imageR = imageRight
        bothImagesLoaded()
    }).catch(error => {
        console.error("Error loading images: ", error)
    })
}

function loadImage(dataUrl) {
    let img = new Image()
    img.src = dataUrl
    return img
}

// called once with images are loaded properly
function bothImagesLoaded() {
    const canvasL = document.getElementById("leftC")
    canvasL.width = Math.min(imageL.width, imageR.width) * SCALE
    canvasL.height = Math.min(imageL.height, imageR.height) * SCALE
    const ctxL = canvasL.getContext("2d")
    ctxL.drawImage(imageL, 0, 0, canvasL.width, canvasL.height)

    const canvasR = document.getElementById("rightC")
    canvasR.width = canvasL.width
    canvasR.height = canvasL.height
    const ctxR = canvasR.getContext("2d")
    ctxR.drawImage(imageR, 0, 0, canvasR.width, canvasR.height)

    canvasL.addEventListener("click", function (event) {
        const boundingRect = canvasL.getBoundingClientRect()
        const clickPosX = event.clientX - boundingRect.left
        const clickPosY = event.clientY - boundingRect.top

        imageTransforms.left.center = [
            clickPosX / canvasL.width,
            clickPosY / canvasL.height
        ]
        updateOverLayImage(imageL, imageR)
    })

    canvasR.addEventListener("click", function (event) {
        const boundingRect = canvasR.getBoundingClientRect()
        const clickPosX = event.clientX - boundingRect.left
        const clickPosY = event.clientY - boundingRect.top

        imageTransforms.right.center = [
            clickPosX / canvasR.width,
            clickPosY / canvasR.height
        ]
        updateOverLayImage(imageL, imageR)
    })
}

function updateOverLayImage() {
    const overlayC = document.getElementById("overlayC")
    const ctxO = overlayC.getContext("2d")
    overlayC.width = Math.min(imageL.width, imageR.width) * SCALE
    overlayC.height = Math.min(imageL.height, imageR.height) * SCALE

    const averageCenter = [
        (imageTransforms.left.center[0] + imageTransforms.right.center[0]) / 2,
        (imageTransforms.left.center[1] + imageTransforms.right.center[1]) / 2,
    ]

    ctxO.translate(
        averageCenter[0] * overlayC.width,
        averageCenter[1] * overlayC.height
    )
    ctxO.rotate(imageTransforms.left.rotation)
    ctxO.translate(
        -imageTransforms.left.center[0] * overlayC.width,
        -imageTransforms.left.center[1] * overlayC.height
    )
    ctxO.drawImage(imageL, 0, 0, overlayC.width, overlayC.height)

    ctxO.globalAlpha = 0.5
    ctxO.resetTransform()

    ctxO.translate(
        averageCenter[0] * overlayC.width,
        averageCenter[1] * overlayC.height
    )
    ctxO.rotate(imageTransforms.right.rotation)
    ctxO.translate(
        -imageTransforms.right.center[0] * overlayC.width,
        -imageTransforms.right.center[1] * overlayC.height
    )
    ctxO.drawImage(imageR, 0, 0, overlayC.width, overlayC.height)
}

function updateFinalImages() {
    const averageCenter = [
        (imageTransforms.left.center[0] + imageTransforms.right.center[0]) / 2,
        (imageTransforms.left.center[1] + imageTransforms.right.center[1]) / 2,
    ]

    // the cross eye version------------------------------------
    const crossEyeC = document.getElementById("crossEyeC")
    crossEyeC.width = 2 * Math.min(imageL.width, imageR.width)
    crossEyeC.height = Math.min(imageL.height, imageR.height)
    const ctxCE = crossEyeC.getContext("2d")

    ctxCE.translate(
        averageCenter[0] * (crossEyeC.width / 2),
        averageCenter[1] * crossEyeC.height
    )
    ctxCE.rotate(imageTransforms.right.rotation)
    ctxCE.translate(
        -imageTransforms.right.center[0] * crossEyeC.width / 2,
        -imageTransforms.right.center[1] * crossEyeC.height
    )
    ctxCE.drawImage(imageR, 0, 0, crossEyeC.width / 2, crossEyeC.height)

    ctxCE.translate(
        (averageCenter[0] + 1) * (crossEyeC.width / 2),
        averageCenter[1] * crossEyeC.height
    )
    ctxCE.rotate(imageTransforms.left.rotation)
    ctxCE.translate(
        -imageTransforms.left.center[0] * crossEyeC.width / 2,
        -imageTransforms.left.center[1] * crossEyeC.height
    )
    ctxCE.drawImage(imageL, 0, 0, crossEyeC.width / 2, crossEyeC.height)
    // ---------------------------------------------------------

    const vrC = document.getElementById("vrC")
    vrC.width = 1920 * 2 //just make it 4k because it will go through the user's screen anyways
    vrC.height = 1080 * 2
    const ctxVR = vrC.getContext("2d")

    ctxVR.fillStyle = "black"
    ctxVR.fillRect(0, 0, vrC.width, vrC.height)

    if (imageL.width / imageL.height < vrC.width / vrC.height) { //more square or vertical than 16:9
        ctxVR.translate(
            averageCenter[0] * vrC.width / 2,
            averageCenter[1] * vrC.height
        )
        ctxVR.rotate(imageTransforms.left.rotation)
        ctxVR.translate(
            -imageTransforms.left.center[0] * vrC.width / 2,
            -imageTransforms.left.center[1] * vrC.height
        )
        ctxVR.drawImage(
            imageL,
            (vrC.width / 2 - (imageL.width * vrC.height / imageL.height) / 2) / 2,
            0,
            (imageL.width * vrC.height / imageL.height) / 2,
            vrC.height
        )

        ctxVR.resetTransform()

        ctxVR.translate(
            averageCenter[0] * vrC.width / 2,
            averageCenter[1] * vrC.height
        )
        ctxVR.rotate(imageTransforms.right.rotation)
        ctxVR.translate(
            -imageTransforms.right.center[0] * vrC.width / 2,
            -imageTransforms.right.center[1] * vrC.height
        )
        ctxVR.drawImage(
            imageR,
            (vrC.width / 2 - (imageR.width * vrC.height / imageR.height) / 2) / 2 + vrC.width / 2,
            0,
            (imageR.width * vrC.height / imageR.height) / 2,
            vrC.height
        )
    } else { //never actually tested, cant be bothered :)
        ctxVR.translate(
            averageCenter[0] * vrC.width / 2,
            averageCenter[1] * vrC.height
        )
        ctxVR.rotate(imageTransforms.left.rotation)
        ctxVR.translate(
            -imageTransforms.left.center[0] * vrC.width / 2,
            -imageTransforms.left.center[1] * vrC.height
        )
        ctxVR.drawImage(
            imageL,
            0,
            (vrC.height - imageL.height * (vrC.width / 2) / imageL.width) / 2,
            vrC.width / 2,
            imageL.height * (vrC.width / 2) / imageL.width
        )

        ctxVR.resetTransform()

        ctxVR.translate(
            averageCenter[0] * vrC.width / 2,
            averageCenter[1] * vrC.height
        )
        ctxVR.rotate(imageTransforms.right.rotation)
        ctxVR.translate(
            -imageTransforms.right.center[0] * vrC.width / 2,
            -imageTransforms.right.center[1] * vrC.height
        )
        ctxVR.drawImage(
            imageL,
            vrC.width / 2,
            (vrC.height - imageL.height * (vrC.width / 2) / imageL.width) / 2,
            vrC.width / 2,
            imageL.height * (vrC.width / 2) / imageL.width
        )
    }
}

window.onkeydown = function (e) {
    if (e.key.toLowerCase() == "e") {
        imageTransforms.left.rotation -= 0.01
        if (imageL && imageR) {
            updateOverLayImage()
        }
    }
    if (e.key.toLowerCase() == "q") {
        imageTransforms.left.rotation += 0.01
        if (imageL && imageR) {
            updateOverLayImage()
        }
    }

    if (e.key.toLowerCase() == "d") {
        imageTransforms.right.rotation -= 0.01
        if (imageL && imageR) {
            updateOverLayImage()
        }
    }
    if (e.key.toLowerCase() == "a") {
        imageTransforms.right.rotation += 0.01
        if (imageL && imageR) {
            updateOverLayImage()
        }
    }
}

// no cyan-red, but who cares really