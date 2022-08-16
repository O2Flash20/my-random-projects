let canvas = {
    X: undefined,
    Y: undefined,
    fps: undefined
}

//eval() alternative
function exe(code) {
    Function(code)()
}

//to get a random integer
function ranInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

//a^2 + b^2 = c^2
function pythag(a, b) {
    return Math.sqrt(a ** 2 + b ** 2)
}

//encoding to UTF-16
function encodeUTF(input) {
    let output = ''

    for (let i = 0; i < input.length; i++) {
        let currentOutput = String(input.charCodeAt(i))

        while (currentOutput.length < 5) {
            currentOutput = "0" + currentOutput
        }

        output += currentOutput
    }

    return output
}

//decoding UTF-16
function decodeUTF(input) {
    let output = ''
    let currentInputSegment = ''

    for (let i = 0; i < input.length; i++) {
        currentInputSegment += input.charAt(i)
        if (currentInputSegment.length == 5) {
            output += String.fromCharCode(currentInputSegment)
            currentInputSegment = ""
        }
    }
    return output
}

//angle to x,y
function angleXY(angle, length) {
    let xy = {}
    angle = angle % 360
    if (angle < 0) {
        angle = 180 + (180 - angle * -1)
    }
    else if (angle == 0) {
        xy.x = 0
        xy.y = 1
    }
    else if (angle == 90) {
        xy.x = 1
        xy.y = 0
    }
    else if (angle == 180) {
        xy.x = 0
        xy.y = -1
    }
    else if (angle == 270) {
        xy.x = -1
        xy.y = 0
    }

    else if (angle > 0 && angle < 90) {
        xy.x = angle / 90
        xy.y = (90 - angle) / 90
    }
    else if (angle > 90 && angle < 180) {
        xy.x = (90 - (angle - 90)) / 90
        xy.y = -1 * (angle - 90) / 90
    }
    else if (angle > 180 && angle < 270) {
        xy.x = -1 * (angle - 180) / 90
        xy.y = -1 * (90 - (angle - 180)) / 90
    }
    else if (angle > 270 && angle < 360) {
        xy.x = -1 * (90 - (angle - 270)) / 90
        xy.y = (angle - 270) / 90
    }

    xy.slope = xy.y / xy.x

    let multiplier = Math.sqrt(length ** 2 / (xy.x ** 2 + xy.y ** 2))

    xy.x *= multiplier
    xy.y *= multiplier

    return xy
}

// map a range to a new range
function map(value, min1, max1, min2, max2) {
    return (value - min1) * ((max2 - min2) / (max1 - min1)) + min2
}

//-----------------------------------------------------------------

//setting up the canvas
let c
let ctx

let c1
let ctx1
function createCanvas(width, height, x, y, resolutionWidth, resolutionHeight) {
    var Canvas = document.createElement("canvas")
    Canvas.width = width
    Canvas.height = height
    Canvas.id = "gameCanvas"
    Canvas.style.left = x + "px"
    Canvas.style.top = y + "px"
    document.body.appendChild(Canvas)

    canvas.X = x
    canvas.Y = y

    c = document.getElementById("gameCanvas")
    ctx = c.getContext("2d")

    text.add("fpsCount", "loading", 10, 10)

    c.addEventListener('mousedown', function (e) {
        //found click, what now?????
        console.log('clicked')

        let currentSprite
        for (let i = sprite.drawOrder.length - 1; i > -1; i--) {
            eval(`currentSprite = sprite.${sprite.drawOrder[i]}`)

            if (mousePos.x > currentSprite.x && mousePos.x < currentSprite.x + currentSprite.width) {
                if (mousePos.y > currentSprite.y && mousePos.y < currentSprite.y + currentSprite.height) {
                    //found sprite clicked, what now??????
                    console.log(currentSprite.name)
                    break
                }
            }
        }
    })

    ctx.imageSmoothingEnabled = false

    var Canvas1 = document.createElement("canvas")
    Canvas1.width = resolutionWidth
    Canvas1.height = resolutionHeight
    Canvas1.id = "gameCanvas1"
    document.body.appendChild(Canvas1)

    c1 = Canvas1
    ctx1 = c1.getContext("2d")

    //fix up
    ctx1.scale(10, 10)

    Canvas1.style.left = "100px"
    Canvas1.style.top = "100px"

    ctx1.imageSmoothingEnabled = false
}

//library of images for the game
let imageLibrary = {
    add: function (name, src) {
        exe(`imageLibrary.${name} = new Image()`)
        exe(`imageLibrary.${name}.src = '${src}'`)
        exe(`imageLibrary.${name}.crossOrigin = "Anonymous"`)
    }
}

//fix these up a bit
let framesList = []

let s = 0

//sets the loop rate
function setGameLoop(refreshRate) {
    let repeatWait = 1000 / refreshRate

    let gameLoop = setInterval(loop1, repeatWait)
}

//setting up framerate display and updating sprites
function loop1() {
    framesList.push(Date.now())

    if (framesList.length > 20) {
        framesList.splice(0, 1)
    }

    let fps = Math.round(19 / ((framesList[19] - framesList[0]) / 1000))

    if (Number.isNaN(fps)) {
        canvas.fps = 60
    } else {
        canvas.fps = fps
    }

    text.fpsCount.text = canvas.fps
    s = canvas.fps

    updateScreen()
    loop()

    ctx1.drawImage(c, 0, 0)
}

setTimeout(start, 1000)

//update the entire screen
function updateScreen() {
    drawBg()
    updateSprites()
    updateLines()
    updateText()
}

//LINES----------------------------------------------------------------------
let line = {
    add: function (name, x1, y1, x2, y2, style) {
        exe(`line.${name} = new lineData("${name}", "${x1}", "${y1}", "${x2}", "${y2}", "${style}")`)
        this.drawOrder.push(name)
    },

    drawOrder: []
}

function lineData(name, x1, y1, x2, y2, style) {
    this.name = name
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2

    if (style == "undefined") {
        this.style = "#FF0000"
    } else {
        this.style = style
    }

    this.hidden = false

    this.draw = function () {
        ctx.beginPath()
        ctx.moveTo(this.x1, this.y1)
        ctx.lineTo(this.x2, this.y2)

        ctx.strokeStyle = this.style

        ctx.stroke()
    }

    this.length = function () {
        return Math.sqrt((this.x1 - this.x2) ** 2 + (this.y1 - this.y2) ** 2)
    }
}

function updateLines() {
    for (let i = 0; i < line.drawOrder.length; i++) {
        if (eval(`line.${line.drawOrder[i]}.hidden`) == false) {
            exe(`line.${line.drawOrder[i]}.draw()`)
        }
    }
}
//--------------------------------------------------------------------------

//TEXT----------------------------------------------------------------------
let text = {
    add: function (name, text, x, y, style) {
        exe(`text.${name} = new textData("${name}", "${text}", ${x}, ${y}, "${style}")`)
        console.log(name)
        this.drawOrder.push(name)
    },

    drawOrder: []
}

function textData(name, text, x, y, style) {
    this.name = name
    this.text = text
    this.x = x
    this.y = y

    this.hidden = false

    if (style == "undefined") {
        this.style = "10px Arial"
    } else {
        this.style = style
    }

    this.draw = function () {
        ctx.font = this.style
        ctx.fillText(this.text, this.x, this.y)
    }
}

function updateText() {
    for (let i = 0; i < text.drawOrder.length; i++) {
        if (eval(`text.${text.drawOrder[i]}.hidden`) == false) {
            exe(`text.${text.drawOrder[i]}.draw()`)
        }
    }
}
//--------------------------------------------------------------------------

//BACKGROUND----------------------------------------------------------------
let backgroundSrc = ""
function setBackground(src) {
    let img = new Image()
    img.src = src
    img.crossOrigin = "Anonymous"
    ctx.drawImage(img, 0, 0, c.width, c.height)
    backgroundSrc = src
}

function drawBg() {
    let img = new Image()
    img.src = backgroundSrc
    img.crossOrigin = "Anonymous"
    ctx.drawImage(img, 0, 0, c.width, c.height)
}
//--------------------------------------------------------------------------

//SPRITES--------------------------------------------------------------------
let sprite = {
    add: function (name, x, y, width, height, costume) {
        exe(`sprite.${name} = new spriteData("${name}", ${x}, ${y}, ${width}, ${height}, ${costume})`)
        this.drawOrder.push(name)
    },

    drawOrder: []
}

function spriteData(name, x, y, width, height, costume) {
    //data
    this.name = name
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.costume = costume

    this.hidden = false

    //moving
    this.moveX = function (amount) {
        this.x += amount
    }

    this.moveY = function (amount) {
        this.y += amount
    }

    //setting position
    this.setX = function (location) {
        this.x = location
    }

    this.setY = function (location) {
        this.y = location
    }

    //collision detection
    this.touchingBorder = function () {
        if (this.x <= 0) {
            return { touching: true, direction: "left" }
        }
        if (this.x + this.width >= c.width) {
            return { touching: true, direction: "right" }
        }
        if (this.y <= 0) {
            return { touching: true, direction: "up" }
        }
        if (this.y + this.height >= c.height) {
            return { touching: true, direction: "down" }
        } else {
            return { touching: false, direction: null }
        }
    }

    this.touching = function (other) {

        let touchingDirections = ""

        if (this.x <= other.x + other.width) {
            touchingDirections += "1"
        }
        if (this.x + this.width >= other.x) {
            touchingDirections += "2"
        }
        if (this.y <= other.y + other.height) {
            touchingDirections += "3"
        }
        if (this.y + this.height >= other.y) {
            touchingDirections += "4"
        }

        if (touchingDirections == "1234") {
            return true
        } else {
            return false
            this.lastTouchingDirection = touchingDirections
        }
    }

    //creating copy of sprite
    this.clone = function () {

    }

    //drawing the sprite to the canvas
    this.draw = function () {
        ctx.drawImage(this.costume, this.x, this.y, this.width, this.height)
    }

    //moving the sprite to the back
    this.toBack = function () {
        let output = []
        for (let i = 0; i < sprite.drawOrder.length; i++) {
            output[i + 1] = sprite.drawOrder[i]
        }
        output.splice(output.indexOf(this.name), 1)
        output[0] = this.name

        sprite.drawOrder = output
    }

    //moving the sprite to the front
    this.toFront = function () {
        sprite.drawOrder.splice(sprite.drawOrder.indexOf(this.name), 1)
        sprite.drawOrder.push(this.name)
    }

    //showing and hiding sprites
    this.show = function () {
        this.hidden = false
    }
    this.hide = function () {
        this.hidden = true
    }
}

//update sprites over the background
function updateSprites() {
    for (let i = 0; i < sprite.drawOrder.length; i++) {
        if (eval(`sprite.${sprite.drawOrder[i]}.hidden`) == false) {
            exe(`sprite.${sprite.drawOrder[i]}.draw()`)
        }
    }
}

//------------------------------------------------------------------------------

//SOUNDS------------------------------------------------------------------------
function playSound(src) {
    let sound = new Audio(src)
    sound.play()
}

let soundsSrcPlaying = []
function playSoundOnce(src) {

    if (!soundsSrcPlaying.includes(src)) {

        let sound = new Audio(src)

        soundsSrcPlaying.push(src)

        console.log(soundsSrcPlaying)

        setTimeout(function e() {
            soundsSrcPlaying.splice(soundsSrcPlaying.indexOf(src), 1)
            console.log(soundsSrcPlaying)
        }, sound.duration)

        sound.play()
    }
}

let sounds = {
    play: function (src) {
        let sound = new Audio(src)
        sound.play()
    },

    playOnce: function (src) {
        //no work
        if (!soundsSrcPlaying.includes(src)) {

            let sound = new Audio(src)

            soundsSrcPlaying.push(src)

            console.log(soundsSrcPlaying)

            setTimeout(function e() {
                soundsSrcPlaying.splice(soundsSrcPlaying.indexOf(src), 1)
                console.log(soundsSrcPlaying)
            }, sound.duration)

            sound.play()
        }
    }
}

//------------------------------------------------------------------------------

//INPUTS------------------------------------------------------------------------
let keysHeld = []
document.addEventListener("keydown", event => {
    if (!keysHeld.includes(event.key)) {
        keysHeld.push(event.key)
    }
})

document.addEventListener("keyup", event => {
    keysHeld.splice(keysHeld.indexOf(event.key), 1)
})

let mousePos = { x: undefined, y: undefined }
document.addEventListener('mousemove', logKey)
function logKey(e) {
    mousePos.x = e.clientX - canvas.X
    mousePos.y = e.clientY - canvas.Y
}

//mouse click

//------------------------------------------------------------------------------
//TEST WITH GAME

function start() {
    createCanvas(40, 30, 15, 15, 400, 300)

    imageLibrary.add("man", "https://cdn.glitch.com/147bdf54-5025-4d0b-b7c5-21eee677613b%2Fman.png?v=1630624588719")
    imageLibrary.add("manFall", "https://cdn.glitch.com/147bdf54-5025-4d0b-b7c5-21eee677613b%2FmanFall.png?v=1630624589887")

    setBackground("https://cdn.glitch.com/147bdf54-5025-4d0b-b7c5-21eee677613b%2FDrawing.png?v=1629901846459")

    setGameLoop(60)
}

//the loop of the game
function loop() {
    for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
            let r = ranInt(0, 255)
            ctx.fillStyle = `rgb(${r}, ${r}, ${r})`
            ctx.fillRect(x, y, 1, 1)
        }
    }
}

function createPerlin(width, height, iterations, multiplicationFactor) {
    if (document.getElementById("outputC")) {
        document.getElementById("outputC").remove()
    }

    let output = document.createElement("canvas")
    let outputCTX = output.getContext("2d")
    output.id = "outputC"
    document.body.appendChild(output)
    output.width = width
    output.height = height
    output.style.top = "500px"
    output.style.position = "relative"
    outputCTX.globalCompositeOperation = "soft-light" //overlay-- hard-light- soft light---
    outputCTX.imageSmoothingQuality = 'high'

    for (let i = 0; i < iterations; i++) {
        var Canvas = document.createElement("canvas")
        Canvas.width = (i + 1) * multiplicationFactor
        Canvas.height = (i + 1) * multiplicationFactor
        Canvas.id = "canvas" + i

        let CanvasC = Canvas.getContext("2d")

        Canvas.style.top = "500px"
        Canvas.style.position = "relative"

        document.body.appendChild(Canvas)

        for (let y = 0; y < Canvas.height; y++) {
            for (let x = 0; x < Canvas.width; x++) {
                let r = ranInt(0, 255)
                CanvasC.fillStyle = `rgb(${r}, ${r}, ${r})`
                CanvasC.fillRect(x, y, 1, 1)
            }
        }
        outputCTX.drawImage(Canvas, 0, 0, width, height)

        Canvas.remove()
    }
    let imageData = outputCTX.getImageData(0, 0, width, height)
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 200) {
            outputCTX.fillStyle = `rgb(0, 0, ${map(imageData.data[i], 201, 255, 255, 120)})`
            outputCTX.fillRect((i / 4) % width, Math.floor((i / 4) / width), 1, 1)
        }
        else if (imageData.data[i] > 150) {
            let shade = map(imageData.data[i], 151, 200, 0, 150)
            outputCTX.fillStyle = `rgb(255, 255, ${shade})`
            outputCTX.fillRect((i / 4) % width, Math.floor((i / 4) / width), 1, 1)
        }
        else if (imageData.data[i] > 30) {
            outputCTX.fillStyle = `rgb(0, ${map(imageData.data[i], 31, 150, 140, 255)}, 0)`
            outputCTX.fillRect((i / 4) % width, Math.floor((i / 4) / width), 1, 1)
        }
        else {
            outputCTX.globalCompositeOperation = "source-over"
            let shade = map(imageData.data[i], 8, 0, 220, 240)
            outputCTX.fillStyle = `rgb(${shade}, ${shade}, ${shade})`
            outputCTX.fillRect((i / 4) % width, Math.floor((i / 4) / width), 1, 1)
        }
    }
}