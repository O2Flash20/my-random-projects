let v = document.getElementById("inputVideo")

let cI = document.getElementById("inputCanvas")
let ctxI = cI.getContext("2d")

let c = document.getElementById("compositeCanvas")
let ctx = c.getContext("2d")

let cf = document.getElementById("filterCanvas")
let ctxf = cf.getContext("2d")
ctxf.filter = "blur(5px) brightness(10)"

let cF = document.getElementById("finalCanvas")
let ctxF = cF.getContext("2d")

const constraints = { audio: false, video: true }
navigator.mediaDevices.getDisplayMedia(constraints)
    .then(function (mediaStream) {
        v.srcObject = mediaStream
        v.onloadedmetadata = function (e) {
            v.play()
        }
    })
    .catch(function (err) { console.log(err.name + ": " + err.message) })

setInterval(function () {
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(cI, 0, 0) //put the old video on the screen
    ctxI.drawImage(v, 0, 0) //update the video
    ctx.globalCompositeOperation = 'difference'
    ctx.drawImage(cI, 0, 0) //now put the new one on, now with the difference blend mode on to only get what changed

    ctxf.drawImage(c, 0, 0) //apply the filters on all that (blur and brightness to make it shine)

    ctxF.globalCompositeOperation = 'source-over' //stick it on top of the regular screen
    ctxF.drawImage(v, 0, 0)
    ctxF.globalCompositeOperation = 'screen'
    ctxF.drawImage(cf, 0, 0)
}, 100)