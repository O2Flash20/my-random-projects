let effectShader 
function preload() {
    effectShader = loadShader("basic.vert", "effect.frag")
}

let cameraStream
let filters

let inputCanvas
let compositeCanvas
let accumulatorCanvas
let filterCanvas
let finalCanvas

let lastVideoSize = [0, 0]
let videoLoaded = false
function setup() {
    noCanvas()
    cameraStream = createCapture({
        audio: false,
        video: {
            facingMode: "environment"
        }
    })
    cameraStream.hide()

    inputCanvas = createGraphics()
    compositeCanvas = createGraphics()
    accumulatorCanvas = createGraphics()
    filterCanvas = createGraphics(0, 0, WEBGL)
    filterCanvas.canvas.style = "display: block !IMPORTANT"
    createElement("h2", "Motion used as a glow effect over the original image:")
    finalCanvas = createGraphics()
    finalCanvas.canvas.style = "display: block !IMPORTANT"
}

function draw() {
    if (cameraStream.elt.width !== lastVideoSize[0] || cameraStream.elt.height !== lastVideoSize[1]) {
        lastVideoSize = [cameraStream.elt.width, cameraStream.elt.height]

        inputCanvas.resizeCanvas(lastVideoSize[0], lastVideoSize[1])
        compositeCanvas.resizeCanvas(lastVideoSize[0], lastVideoSize[1])
        accumulatorCanvas.resizeCanvas(lastVideoSize[0], lastVideoSize[1])
        filterCanvas.resizeCanvas(lastVideoSize[0], lastVideoSize[1])
        finalCanvas.resizeCanvas(lastVideoSize[0], lastVideoSize[1])

        videoLoaded = true
    }

    if (!videoLoaded) {return}

    compositeCanvas.blendMode(BLEND)
    compositeCanvas.image(inputCanvas, 0, 0)

    inputCanvas.image(cameraStream, 0, 0)

    compositeCanvas.blendMode(DIFFERENCE)
    compositeCanvas.image(inputCanvas, 0, 0)

    accumulatorCanvas.tint(255, 51)
    accumulatorCanvas.image(compositeCanvas, 0, 0)

    effectShader.setUniform("uTex", accumulatorCanvas)
    filterCanvas.shader(effectShader)
    filterCanvas.rect(0, 0, filterCanvas.canvas.width, filterCanvas.canvas.height)

    finalCanvas.blendMode(BLEND)
    finalCanvas.image(cameraStream, 0, 0)
    finalCanvas.blendMode(ADD)
    finalCanvas.image(filterCanvas, 0, 0)
}

// let cI = document.getElementById("inputCanvas")
// let ctxI = cI.getContext("2d")

// let c = document.getElementById("compositeCanvas")
// let ctx = c.getContext("2d")

// let ca = document.getElementById("accumulatorCanvas")
// let ctxa = ca.getContext("2d")

// let cf = document.getElementById("filterCanvas")
// let ctxf = cf.getContext("2d")

// let cF = document.getElementById("finalCanvas")
// let ctxF = cF.getContext("2d")

// oldWidth = 0
// oldHeight = 0
// setInterval(function () {
//     if (oldWidth !== cameraStream.elt.width) {
//         cI.width = c.width = ca.width = cf.width = cF.width = cameraStream.elt.width
//         ctxf.filter = filters
//     }
//     oldWidth = cameraStream.elt.width
//     if (oldHeight !== cameraStream.elt.height) {
//         cI.height = c.height = ca.height = cf.height = cF.height = cameraStream.elt.height
//         ctxf.filter = filters
//     }
//     oldHeight = cameraStream.elt.height

//     ctx.globalCompositeOperation = 'source-over'
//     ctx.drawImage(cI, 0, 0) //put the old video on the screen
//     ctxI.drawImage(cameraStream.elt, 0, 0) //update the video
//     ctx.globalCompositeOperation = 'difference'
//     ctx.drawImage(cI, 0, 0) //now put the new one on, now with the difference blend mode on to only get what changed

//     ctxa.globalAlpha = 0.2
//     ctxa.drawImage(c, 0, 0)

//     ctxf.drawImage(ca, 0, 0) //apply the filters on all that (blur and brightness to make it shine)

//     ctxF.globalCompositeOperation = 'source-over' //stick it on top of the regular screen
//     ctxF.drawImage(cameraStream.elt, 0, 0)
//     ctxF.globalCompositeOperation = 'screen'
//     ctxF.drawImage(cf, 0, 0)
// }, 16)

