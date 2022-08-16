/*-----------------------------------------------------------------------------*/
/*-------------------------THE ENGINE------------------------------------------*/

//sets up nessesary divs
function setup() {
    var gameCanvas = document.createElement("DIV")
    gameCanvas.id = "gameCanvas"
    document.getElementById("gameHolder").appendChild(gameCanvas)

    var codeHolder = document.createElement("DIV")
    codeHolder.id = "gameCodeHoder"
    document.getElementById("gameHolder").appendChild(codeHolder)

    var scriptsHolder = document.createElement("DIV")
    scriptsHolder.id = "scriptsHolder"
    codeHolder.appendChild(scriptsHolder)

    var stylesHolder = document.createElement("DIV")
    stylesHolder.id = "stylesHolder"
    codeHolder.appendChild(stylesHolder)

    var variableDisplay = document.createElement("DIV")
    variableDisplay.id = "variableDisplayBox"
    document.getElementById("gameHolder").appendChild(variableDisplay)
}

//save the multiplier for canvas size
let canvasMultiplier

//scale the game depending on the canvas size
function scale(input) {
    return ((input / 3) * canvasMultiplier)
}

function unscale(input) {
    return ((input * 3) / canvasMultiplier)
}

//creating the canvas box
function createCanvas(size) {
    canvasMultiplier = size

    var canvasWidth = 300 * parseFloat(size)
    var canvasHeight = 200 * parseFloat(size)

    var canvas = document.createElement("DIV")
    canvas.id = "canvas"

    canvas.style.width = (canvasWidth + "px")
    canvas.style.height = (canvasHeight + "px")

    canvas.style.border = "thick solid #000000"

    document.getElementById("gameCanvas").appendChild(canvas)
}

//creating sprites
let spriteOffset = 0
function createSprite(name, width, height) {
    var newSprite = document.createElement("DIV")
    newSprite.id = name
    newSprite.style.width = (scale(width) + "px")
    newSprite.style.height = (scale(height) + "px")
    newSprite.classList.add("sprite")
    newSprite.classList.add("offset" + spriteOffset)
    document.getElementById("canvas").appendChild(newSprite)
    spriteOffset += scale(height)
}

//return the offset of a sprite
function getOffset(name) {
    var sprite = document.getElementById(name)

    let offsetInt = ""

    for (var i = 0; i < (sprite.classList[1].length - 6); i++) {
        offsetInt += sprite.classList[1].charAt(i + 6)
    }
    return offsetInt
}

//getting the X and Y locations of a sprite
function posX(name) {
    var sprite = document.getElementById(name)

    return Math.round((unscale(parseFloat(sprite.style.left)) - 450) + (unscale(parseFloat(sprite.style.width)) / 2))
}
function posY(name) {
    var sprite = document.getElementById(name)

    return Math.round((unscale(parseFloat(sprite.style.top)) - 300) + (unscale(parseFloat(sprite.style.height)) / 2) + parseFloat(unscale(getOffset(name))))
}

//setting the position of sprites
function goTo(name, x, y) {
    var spriteToMove = document.getElementById(name)

    var spritesOffset = spriteToMove.classList[1]

    spriteToMove.style.left = ((((canvasMultiplier * 300) / 2) + scale(x)) - (parseFloat(document.getElementById(name).style.width) / 2) + "px")

    spriteToMove.style.top = (((((canvasMultiplier * 200) / 2) + scale(-1 * y)) - (parseFloat(document.getElementById(name).style.height) / 2)) - (spriteOffset - parseFloat(spriteToMove.style.height)) + "px")
}

//changing the position of sprites
function move(name, x, y) {
    var spriteToMove = document.getElementById(name)

    spriteToMove.style.left = (parseFloat(spriteToMove.style.left) + scale(x) + "px")
    spriteToMove.style.top = (parseFloat(spriteToMove.style.top) + scale(-1 * y) + "px")
}

//rotate an element
function rotate(name, deg) {
    document.getElementById(name).style.transform = "rotate(" + deg + "deg)" + document.getElementById(name).style.transform
}

//creates an script on the DOM that, when a specific key is pressed, executes a function. I wonder if i will need to give ids to the scripts...
function onKeyPressed(key, result) {
    var keysScript = document.createElement("SCRIPT")
    keysScript.innerHTML = "document.addEventListener('keydown', checkKey);function checkKey(keyPressed){if (keyPressed.key == " + "'" + (key) + "'" + "){" + result + "}}"
    document.getElementById("scriptsHolder").appendChild(keysScript)
}

//returns the postions of two corners of a sprite
function cornersList(name) {
    var sprite = document.getElementById(name)
    var x = posX(name)
    var y = posY(name)

    var topLeft = [Math.round(x - (unscale(parseFloat(sprite.style.width)) / 2)), Math.round(y + (unscale(parseFloat(sprite.style.height)) / 2))]

    var bottomRight = [Math.round(x + (unscale(parseFloat(sprite.style.width)) / 2)), Math.round(y - (unscale(parseFloat(sprite.style.height)) / 2))]

    return [topLeft, bottomRight]
}

//returns true if two elements are touching
//this is very bad, ill do it my own way
function touching(sprite1, sprite2) {
    touchStatusTest = ""

    var s1 = document.getElementById(sprite1)
    var s2 = document.getElementById(sprite2)

    var s1x1 = cornersList(sprite1)[0][0]
    var s1x2 = cornersList(sprite1)[1][0]

    var s1y1 = cornersList(sprite1)[1][1]
    var s1y2 = cornersList(sprite1)[0][1]

    var s2x1 = cornersList(sprite2)[0][0]
    var s2x2 = cornersList(sprite2)[1][0]

    var s2y1 = cornersList(sprite1)[1][1]
    var s2y2 = cornersList(sprite2)[0][1]



    if (s1x1 >= s2x1 && s1x1 <= s2x2) {
        touchStatusTest += ",left"
    }
    if (s1x2 >= s2x1 && s1x2 <= s2x2) {
        touchStatusTest += ",right"
    }

    if (s1y1 >= s2y1 && s1y1 <= s2y2) {
        touchStatusTest += ",top"
    }
    if (s1y2 >= s2y1 && s1y2 <= s2y2) {
        touchStatusTest += ",down"
    }
    if ((((s1x1 >= s2x1) && (s1x1 <= s2x2)) || ((s1x2 >= s2x1) && (s1x2 <= s2x2))) && (((s1y1 >= s2y1) && (s1y1 <= s2y2)) || ((s1y2 >= s2y1) && (s1y2 <= s2y2)))) {
        if (s1y1 > s2y2 || s2y1 > s1y2) {
            return true
        }
    }

    if ((((s2x1 >= s1x1) && (s2x1 <= s1x2)) || ((s2x2 >= s1x1) && (s2x2 <= s1x2))) && (((s2y1 >= s1y1) && (s2y1 <= s1y2)) || ((s2y2 >= s1y1) && (s2y2 <= s1y2)))) {
        if (/*this is very bad, doesn't work fix now yes*/(s1y1 > s2y2 || s2y1 > s1y2) /*add a thing here for the bug*/) {
            return true
        }
    }

    else {
        return false
    }

}
//returns true if the sprite is touching a border
function touchingBorder(name, direction) {
    var corners = cornersList(name)

    //if any of the two y coordinates are the coordinates of the border or any of the two x coordinates are the coordinates of the border, return true
    if (direction == "x" || "y") {
        if (direction == "x") {
            if ((corners[0][0] <= -450 || corners[1][0] >= 450)) {
                return true
            }
            else {
                return false
            }
        }

        if (direction == "y") {
            if ((corners[0][1] >= 300 || corners[1][1] <= -300)) {
                return true
            }
            else {
                return false
            }
        }
    }
    if (direction !== "x" || "y") {
        if ((corners[0][1] >= 300 || corners[1][1] <= -300) || (corners[0][0] <= -450 || corners[1][0] >= 450)) {
            return true
        }
        else {
            return false
        }
    }
}

//set the canvas background
function setBackground(url) {
    document.getElementById("canvas").style.backgroundImage = "url('" + url + ");"
}

//set the costume of a sprite
function setCostume(name, url, removeHitbox) {
    document.getElementById(name).style.backgroundImage = "url('" + url + ");"
    if (removeHitbox) {
        document.getElementById(name).style.backgroundColor = "transparent"
    }
}

//plays a sound
function playSound(url) {
    var audio = new Audio(url)
    audio.play()
}


//hide and show a sprite
function hide(name) {
    document.getElementById(name).style.opacity = "0"
}
function show(name) {
    document.getElementById(name).style.opacity = "1"
}

//scale a sprite
function scaleSprite(name, scale) {
    document.getElementById(name).style.transform = "scale(" + scale + ")" + document.getElementById(name).style.transform
}

//displays a variable in the DOM
function showVar(variable, round) {
    var variableDisplayScript = document.createElement("SCRIPT")
    variableDisplayScript.id = (variable + "DisplayScript")

    var variableDisplay = document.createElement("P")
    variableDisplay.id = (variable + "Display")

    if (round) {
        variableDisplayScript.innerHTML = "setInterval((function e(){document.getElementById(" + "'" + variable + 'Display' + "'" + ").innerHTML = " + "'" + variable + "'" + "+': '" + "+" + "Math.round(" + variable + ")}), 50)"
    }
    else {
        variableDisplayScript.innerHTML = "setInterval((function e(){document.getElementById(" + "'" + variable + 'Display' + "'" + ").innerHTML = " + "'" + variable + "'" + "+': '" + "+" + variable + "}), 50)"
    }

    document.getElementById("scriptsHolder").appendChild(variableDisplayScript)

    document.getElementById("variableDisplayBox").appendChild(variableDisplay)
}
/*-----------------------------------------------------------------------------*/
/*-------------------------USER'S CODE-----------------------------------------*/

setup()

createCanvas(3)

createSprite("jeff", 100, 100)
goTo("jeff", 0, 0)

createSprite("bob", 50, 50)
goTo("bob", -100, 0)

createSprite("sam", 25, 25)
goTo("sam", 100, 0)

onKeyPressed("l", "keyTest()")
function keyTest() {
    console.log("L")
}

let SamMomentumY = 0
setInterval(samGravity, 10)
function samGravity() {

    SamMomentumY += 0.05
    SamMomentumX = SamMomentumX / 1

    move("sam", 0, (-1 * SamMomentumY))
}
onKeyPressed("ArrowUp", "samJump()")
function samJump() {
    SamMomentumY += -5
}

let SamMomentumX = 0
setInterval(samMomentumX, 10)
function samMomentumX() {
    move("sam", SamMomentumX, 0)
}
onKeyPressed("ArrowLeft", "samLeft()")
function samLeft() {
    SamMomentumX -= 1
}
onKeyPressed("ArrowRight", "samRight()")
function samRight() {
    SamMomentumX += 1
}
onKeyPressed("ArrowDown", "samDown()")
function samDown() {
    rotate('sam', 30)
}

cornersList("jeff")
cornersList("bob")

setInterval(samBorder, 10)
function samBorder() {
    if (touchingBorder('sam', "x")) {
        SamMomentumX *= -1
    }
    if (touchingBorder('sam', "y")) {
        SamMomentumY *= -1
    }
    if (touchingBorder('sam')) {
        //playSound('https://cdn.glitch.com/be0f27cd-0abe-40fa-b9af-5081c139362b%2FHamburger%20Meme%20Sound%20Effect.mp3?v=1617842042614')
    }
}

setCostume("sam", "https://cdn.glitch.com/be0f27cd-0abe-40fa-b9af-5081c139362b%2Fpett.gif?v=1617840956064", true)

onKeyPressed("h", "hide('jeff')")
onKeyPressed("s", "show('jeff')")

showVar('SamMomentumY', true)
showVar('SamMomentumX')

setInterval(touchJeff, 10)
function touchJeff() {
    if (touching('sam', 'bob')) {
        console.log('e')
    }
}

onKeyPressed("b", "scaleSprite('jeff', 0.1)")

//setInterval((function e(){rotate('sam', SamMomentumX)}), 10)

let samX = 0
let samY = 0
setInterval(samXY, 100)
function samXY() {
    samX = posX('sam')
    samY = posY('sam')
}
showVar('samX')
showVar('samY')

let touchStatusTest = ""
showVar('touchStatusTest')