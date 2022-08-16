let c = document.getElementById("displayCanvas")
let ctx = c.getContext("2d")
let c1 = document.getElementById("displayCanvas1")
let ctx1 = c1.getContext("2d")
let c2 = document.getElementById("displayCanvas2")
let ctx2 = c2.getContext("2d")

function start(pixelSize, filters) {

    // Prefer camera resolution nearest to 1280x720.
    var constraints = { audio: false, video: true }
    var video = document.querySelector('video')

    navigator.mediaDevices.getDisplayMedia(constraints)
        .then(function (mediaStream) {
            video.srcObject = mediaStream
            video.onloadedmetadata = function (e) {
                video.play()
            }
        })
        .catch(function (err) { console.log(err.name + ": " + err.message) })

    let height = 1050
    let width = 1680
    console.log(width, height, pixelSize)


    c.width = width / pixelSize
    c.height = height / pixelSize
    ctx.scale(1 / pixelSize, 1 / pixelSize)


    c1.width = 1920
    c1.height = 1080
    ctx1.scale((1920 / 1680) * pixelSize, (1080 / 1050) * pixelSize)
    ctx1.imageSmoothingEnabled = false

    setInterval(function drawToCanvas() {
        ctx.drawImage(video, 0, 0)
        ctx1.drawImage(c, 0, 0)

        ctx2.putImageData(new ImageData(rgbShift(20), 1920, 1080), 0, 0)
    }, 16)

    c1.style.filter = document.getElementById("startFilters").value
}

function rgbShift(strength) {
    let input = document.getElementById("displayCanvas1").getContext("2d").getImageData(0, 0, c1.width, c1.height).data
    let output = input

    for (let i = output.length; i > 0; i--) {
        if (i % 4 == 0) {
            output[i] = input[i - (strength * 4)]
        }
        if (i % (4 + 1) == 0) {
            output[i] = input[i - (strength * 4)]
        }
    }
    return output
}

function getPixelRGBA() {
    let input = document.getElementById("displayCanvas1").getContext("2d").getImageData(0, 0, c1.width, c1.height).data
    let output = []

    console.log(input)

    for (let i = 0; i < input.length / 4; i++) {
        output[i] = new Array()
        for (let e = 0; e < 4; e++) {
            output[i].push(input[i * 4 + e])
        }
    }

    return (output)
}

function randomNumber(max, min) {
    return Math.floor(Math.random() * (max - min)) + min
}