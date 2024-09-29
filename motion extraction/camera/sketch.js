let v = document.getElementById("inputVideo")

let cI = document.getElementById("inputCanvas")
let ctxI = cI.getContext("2d")

let c = document.getElementById("compositeCanvas")
let ctx = c.getContext("2d")

const filters = "brightness(5) contrast(2) brightness(20) blur(5px)"
let cf = document.getElementById("filterCanvas")
let ctxf = cf.getContext("2d")

let cF = document.getElementById("finalCanvas")
let ctxF = cF.getContext("2d")

oldWidth = 0
oldHeight = 0
setInterval(function () {
    if (oldWidth !== cameraStream.elt.width) {
        cI.width = c.width = cf.width = cF.width = cameraStream.elt.width
        ctxf.filter = filters
    }
    oldWidth = cameraStream.elt.width
    if (oldHeight !== cameraStream.elt.height) {
        cI.height = c.height = cf.height = cF.height = cameraStream.elt.height
        ctxf.filter = filters
    }
    oldHeight = cameraStream.elt.height

    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(cI, 0, 0) //put the old video on the screen
    ctxI.drawImage(cameraStream.elt, 0, 0) //update the video
    ctx.globalCompositeOperation = 'difference'
    ctx.drawImage(cI, 0, 0) //now put the new one on, now with the difference blend mode on to only get what changed

    ctxf.drawImage(c, 0, 0) //apply the filters on all that (blur and brightness to make it shine)

    ctxF.globalCompositeOperation = 'source-over' //stick it on top of the regular screen
    ctxF.drawImage(cameraStream.elt, 0, 0)
    ctxF.globalCompositeOperation = 'screen'
    ctxF.drawImage(cf, 0, 0)
}, 100)

let cameraStream
function setup(){
    noCanvas()
    cameraStream = createCapture({audio: false,
        video: {
            facingMode: "environment"
        }
    })
    cameraStream.hide()

    console.log()
}