function createElement(type, innerHTML, id, container, style) {
    const el = document.createElement(type)
    el.innerHTML = innerHTML
    el.id = id
    el.style = style
    document.getElementById(container).appendChild(el)
}

function random(min, max) {
    return (Math.floor(Math.random() * (max + 1 - min))) + min
}

const colours = ["black", "white", "blue", "red", "green", "yellow"]

//translating 0, 0 coordinates to raw
function c00(x, y) {
    return [x + displayW / 2, (1 * y) + displayH / 2]
}

//DISPLAY___________________________________________________________________________
//diplaying an image
let displayW
let displayH
function display(width, height, imageArray) {
    displayW = width
    displayH = height
    document.getElementById("display").innerHTML = ""
    for (let i = 0; i < height; i++) {
        createElement("div", null, "imageLayer" + i, "display")
        for (let e = 0; e < width; e++) {
            createElement("span", null, `image${e},${i}`, "imageLayer" + i, "width:" + 720 / width + "px;height:" + 480 / height + "px; background:" + colours[imageArray[width * i + e]] + ";display:inline-block;")
        }
    }
    saveBackground()
}

//making a customizable fully black display
function blankDisplay(width, height) {
    return new Array(width * height).fill(0)
}
//__________________________________________________________________________________

//changing a pixel
function pixel(xy, colour) {
    if (0 <= xy[0] && xy[0] < displayW) {
        if (0 <= xy[1] && xy[1] < displayH) {
            document.getElementById("image" + Math.round(xy[0]) + "," + Math.round(xy[1])).style.background = [colours[colour]]
        }
    }
}

//LINES_________________________________________________________________________________________
//lines with math
function lineFromFunction(rule) {
    let y = 0
    let x = 0

    for (let x = 0; x < displayW; x += 0.01) {
        eval(rule)
        pixel(Math.round(x), Math.round(displayH - y - 1), 5)
    }
}

//draw a line between two points
function line(x1, y1, x2, y2) {
    //find m
    let m = (y2 - y1) / (x2 - x1)

    //find b
    let b = y1 - (x1 * m)

    //rule
    let rule = "y=" + m + "*x+" + b

    //same as lineFromFunction but with test for the range
    let y = 0
    let x = 0

    for (let x = 0; x < displayW; x += 0.1) {
        eval(rule)
        if ((x1 < x && x < x2) || (x2 < x && x < x1)) {
            pixel(Math.round(x), Math.round(displayH - y - 1), 5)
        }
    }
}

function patternTest() {
    for (let i = 1; i < displayW / 2; i++) {
        lineFromFunction("y=1/" + i + "x")
    }
}
//_____________________________________________________________________________________________


//BACKGROUNDS__________________________________________________________________________________
let background = []

//setting the entire screen to only the background
function pasteBackground() {
    display(displayW, displayH, background)
}

//adding an image onto the display
function pixelImage(xPos, yPos, width, height, pixels) {
    pasteBackground()

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            pixel(c00(x + xPos, y + yPos), pixels[width * y + x])
        }
    }
    saveBackground()
}

//saving current screen as background
function saveBackground() {
    background = []
    for (let i = 0; i < displayW * displayH; i++) {
        background.push(colours.indexOf(document.getElementById(`image${i % displayW},${Math.floor(i / displayW)}`).style.background))
    }
}
//____________________________________________________________________________________________


//SPRITES_____________________________________________________________________________________
let spriteId = []
let spriteVal = []

//adding a new sprite
function addSprite(name, xPos, yPos, width, height, pixels) {
    spriteId.push(name)
    spriteVal.push([xPos, yPos, width, height, pixels])
    updateSprites()
}

//changing the coordinates of a sprite
function moveSprite(name, x, y) {
    spriteVal[spriteId.indexOf(name)][0] += x
    spriteVal[spriteId.indexOf(name)][1] += y
    updateSprites()
}

//setting the coordinates of a sprite
function setSprite(name, x, y) {
    spriteVal[spriteId.indexOf(name)][0] = x
    spriteVal[spriteId.indexOf(name)][1] = y
    updateSprites()
}

//updating all sprites' positions
function updateSprites() {
    pasteBackground()

    for (let i = 0; i < spriteId.length; i++) {

        for (let y = 0; y < spriteVal[i][3]; y++) {
            for (let x = 0; x < spriteVal[i][2]; x++) {
                pixel(c00(x + spriteVal[i][0], y + spriteVal[i][1]), spriteVal[i][4][spriteVal[i][2] * y + x])
            }
        }

    }
}

//test if sprites are touching
function touching(sprite1, sprite2) {
    let xRange1 = [spriteVal[spriteId.indexOf(sprite1)][0], spriteVal[spriteId.indexOf(sprite1)][0] + spriteVal[spriteId.indexOf(sprite1)][2] - 1]
    let xRange2 = [spriteVal[spriteId.indexOf(sprite2)][0], spriteVal[spriteId.indexOf(sprite2)][0] + spriteVal[spriteId.indexOf(sprite2)][2] - 1]

    let yRange1 = [spriteVal[spriteId.indexOf(sprite1)][1], spriteVal[spriteId.indexOf(sprite1)][1] + spriteVal[spriteId.indexOf(sprite1)][3] - 1]
    let yRange2 = [spriteVal[spriteId.indexOf(sprite2)][1], spriteVal[spriteId.indexOf(sprite2)][1] + spriteVal[spriteId.indexOf(sprite2)][3] - 1]

    if ((xRange1[0] <= xRange2[0] && xRange2[0] <= xRange1[1]) || (xRange1[0] <= xRange2[1] && xRange2[1] <= xRange1[1]) || (xRange2[0] <= xRange1[0] && xRange1[0] <= xRange2[1]) || (xRange2[0] <= xRange1[1] && xRange1[1] <= xRange2[1])) {
        if ((yRange1[0] <= yRange2[0] && yRange2[0] <= yRange1[1]) || (yRange1[0] <= yRange2[1] && yRange2[1] <= yRange1[1]) || (yRange2[0] <= yRange1[0] && yRange1[0] <= yRange2[1]) || (yRange2[0] <= yRange1[1] && yRange1[1] <= yRange2[1])) {
            return true
        }
    }
}

//test if a sprite is touching a border
function touchingBorder(sprite) {
    let xRange = [spriteVal[spriteId.indexOf(sprite)][0], spriteVal[spriteId.indexOf(sprite)][0] + spriteVal[spriteId.indexOf(sprite)][2] - 1]
    let yRange = [spriteVal[spriteId.indexOf(sprite)][1], spriteVal[spriteId.indexOf(sprite)][1] + spriteVal[spriteId.indexOf(sprite)][3] - 1]

    if (xRange[0] <= -1 * displayW / 2 || xRange[1] >= displayW / 2 || yRange[0] <= displayH * -1 / 2 || yRange[1] >= displayH / 2) {
        return true
    }
}
//____________________________________________________________________________________________


//TESTING WITH GAME___________________________________________________________________________
function testStartGame() {
    display(100, 50, blankDisplay(100, 50))
    addSprite("man", 0, 0, 2, 4, [
        3, 3,
        3, 3,
        3, 3,
        3, 3,
    ])

    addSprite("box", -10, -5, 2, 2, [
        5, 5,
        5, 5
    ])

    pixelImage(9, 9, 10, 10, [
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 1, 1, 2, 2, 5, 5, 5, 2,
        2, 1, 1, 1, 1, 2, 5, 5, 5, 2,
        2, 2, 2, 2, 2, 2, 5, 5, 5, 2,
        2, 2, 2, 1, 1, 2, 2, 2, 2, 2,
        2, 2, 1, 1, 1, 1, 1, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 4, 4, 2, 4, 4, 4, 2, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4
    ])
}

function manUp() {
    moveSprite("man", 0, -1)
    if (touching("man", "box")) {
        moveSprite("box", 0, -1)
    }
}
function manDown() {
    moveSprite("man", 0, 1)
    if (touching("man", "box")) {
        moveSprite("box", 0, 1)
    }
}
function manLeft() {
    moveSprite("man", -1, 0)
    if (touching("man", "box")) {
        moveSprite("box", -1, 0)
    }
}
function manRight() {
    moveSprite("man", 1, 0)
    if (touching("man", "box")) {
        moveSprite("box", 1, 0)
    }
}