let originPos = { x: 500, y: 300 }
let scale = 100 //pixels per unit on the plane

let coefficients = [] // the coefficients of the solved polynomial, the first is the highest order

let mouseIsDraggingGraph = false

let mouseIsDraggingPoint = false
let mouseIsDraggingSlope = false
let pointDragged = null

let mousePos = { x: 0, y: 0 }

let pointsInputsDiv

let backdropImg
function uploadBackdrop(){
    const fileInput = document.getElementById("fileInput")
    const imageFile = fileInput.files[0]
    const imageURL = URL.createObjectURL(new Blob([imageFile]))
    backdropImg = loadImage(imageURL)
}

let overUnderShader
let edgeShader
let dilateShader
let functionCanvas
let functionCanvasColor
function preload() {
    overUnderShader = loadShader("shaders/basic.vert", "shaders/overUnder.frag")
    edgeShader = loadShader("shaders/basic.vert", "shaders/edge.frag")
    dilateShader = loadShader("shaders/basic.vert", "shaders/dilate.frag")
}

function windowResized(){
    resizeCanvas(innerWidth*0.70, innerHeight*0.75)
    functionCanvas.resizeCanvas(width, height)
    functionCanvasColor.resizeCanvas(width, height)
}

function setup() {
    createCanvas(innerWidth*0.70, innerHeight*0.75)
    stroke("white")
    textSize(20)

    canvas.addEventListener('wheel', function (event) {
        const scaleMultiplier = 1 - event.deltaY / 1000
        scale *= scaleMultiplier //zoom in or out

        const originRelativeToCursor = { x: originPos.x - mouseX, y: originPos.y - mouseY }
        const originRelativeToCursorAfterScroll = { x: originRelativeToCursor.x * scaleMultiplier, y: originRelativeToCursor.y * scaleMultiplier }
        const newOrigin = { x: originRelativeToCursorAfterScroll.x + mouseX, y: originRelativeToCursorAfterScroll.y + mouseY }
        originPos = newOrigin
    })

    canvas.addEventListener("mousedown", function (event) {
        // have to figure out whether to drag the entire canvas, a point, or a slope control
        for (let i = 0; i < points.length; i++) {
            const p = points[i]

            const pointCanvasPos = graphPosToCanvasPos(p.pos)
            const distanceToPoint = Math.sqrt((mouseX - pointCanvasPos.x) ** 2 + (mouseY - pointCanvasPos.y) ** 2)

            let distanceToSlopeControl = 100000
            if (p.slope !== undefined) {
                const L = Math.sqrt(p.slope ** 2 + 1)
                const slopeLine = {
                    x: 1 / L,
                    y: -p.slope / L //negative because negative is up in canvas space
                }
                const slopeControlPos = { x: pointCanvasPos.x + 50 * slopeLine.x, y: pointCanvasPos.y + 50 * slopeLine.y }
                distanceToSlopeControl = Math.sqrt((mouseX - slopeControlPos.x) ** 2 + (mouseY - slopeControlPos.y) ** 2)
            }

            // if the mouse is closer to a point, move it around
            if (distanceToPoint <= 10 && distanceToPoint < distanceToSlopeControl) {
                mouseIsDraggingPoint = true
                mouseIsDraggingSlope = false
                mouseIsDraggingGraph = false
                pointDragged = i
            }
            // if the mouse is closer to a slope control, grab that instead
            else if (distanceToSlopeControl <= 10 && distanceToSlopeControl <= distanceToPoint) {
                mouseIsDraggingPoint = false
                mouseIsDraggingSlope = true
                mouseIsDraggingGraph = false
                pointDragged = i
            }
        }
        // if nothing in particular was grabbed, grab the graph
        if (!(mouseIsDraggingPoint || mouseIsDraggingSlope)) { mouseIsDraggingGraph = true }
    })
    canvas.addEventListener("mouseup", function (event) {
        if (mouseIsDraggingPoint || mouseIsDraggingSlope) { updateInputsFromPoints(); calculateCoefficients(points) }
        mouseIsDraggingGraph = false
        mouseIsDraggingPoint = false
        mouseIsDraggingSlope = false
    })
    canvas.addEventListener("mouseleave", function (event) {
        if (mouseIsDraggingPoint || mouseIsDraggingSlope) { updateInputsFromPoints(); calculateCoefficients(points) }
        mouseIsDraggingGraph = false
        mouseIsDraggingPoint = false
        mouseIsDraggingSlope = false
    })
    canvas.addEventListener("mousemove", function (event) {
        const mouseDp = { x: event.clientX - mousePos.x, y: event.clientY - mousePos.y }
        mousePos = { x: event.clientX, y: event.clientY }
        if (mouseIsDraggingGraph) {
            originPos = { x: originPos.x + mouseDp.x, y: originPos.y + mouseDp.y }
        }
        else if (mouseIsDraggingPoint) {
            const mouseGraphPos = canvasPosToGraphPos({ x: mouseX, y: mouseY })
            points[pointDragged].pos = mouseGraphPos
        }
        else if (mouseIsDraggingSlope) {
            const mouseGraphPos = canvasPosToGraphPos({ x: mouseX, y: mouseY })
            const p = points[pointDragged]
            const mouseToPoint = { x: mouseGraphPos.x - p.pos.x, y: mouseGraphPos.y - p.pos.y }
            const newSlope = mouseToPoint.y / mouseToPoint.x
            p.slope = newSlope
        }

        const numberOfEquations = formatPoints().length
        if (numberOfEquations > 1 && numberOfEquations <= 6) { calculateCoefficients() }
    })

    functionCanvas = createGraphics(width, height, WEBGL)
    functionCanvasColor = createGraphics(width, height, WEBGL)

    // set up the css file to the iframes to avoid flickering
    let frameStyles1 = document.createElement("link")
    frameStyles1.rel = "styleSheet"
    frameStyles1.href = "style.css"
    document.getElementById("equationFrame").contentWindow.document.head.appendChild(frameStyles1)
    let frameStyles2 = document.createElement("link")
    frameStyles2.rel = "styleSheet"
    frameStyles2.href = "style.css"
    document.getElementById("inputsFrame").contentWindow.document.head.appendChild(frameStyles2)

    // add their titles
    const equationTitle = document.createElement("h2")
    equationTitle.innerText = "Equation"
    document.getElementById("equationFrame").contentWindow.document.body.appendChild(equationTitle)
    const pointsTitle = document.createElement("h2")
    pointsTitle.innerText = "Points"
    document.getElementById("inputsFrame").contentWindow.document.body.appendChild(pointsTitle)
}

let t = 0
function draw() {
    t += deltaTime / 1000

    background(25)

    if (backdropImg) {
        const imageWidth = document.getElementById("backdropWidthInput").value*scale
        const imageHeight = backdropImg.height/backdropImg.width*imageWidth
        image(backdropImg, originPos.x, originPos.y-imageHeight, imageWidth, imageHeight)
    }

    // render the grid
    stroke(255)
    strokeWeight(7)
    line(originPos.x, 0, originPos.x, height)
    line(0, originPos.y, width, originPos.y)

    const numbersInterval = width / (scale * 10)
    const gridScale = nearestNiceNumber(numbersInterval)

    const numDecimals = gridScale >= 1 ? 0 : Math.max(0, -Math.floor(Math.log10(gridScale))) //the number of decimal places in the text showing the scale

    strokeWeight(2)
    fill(255)
    const lineSpacing = gridScale * scale // spacing in pixels

    textAlign(CENTER, TOP)
    const verticalLinesUntilOrigin = originPos.x / lineSpacing
    const firstVerticalLine = verticalLinesUntilOrigin % 1 * lineSpacing
    const numberVerticalLines = Math.ceil(width / lineSpacing) + 1
    for (let i = 0; i < numberVerticalLines; i++) {
        const label = Math.ceil(i - verticalLinesUntilOrigin) * gridScale

        strokeWeight(2)
        stroke(150)
        line(firstVerticalLine + i * gridScale * scale, 0, firstVerticalLine + i * gridScale * scale, height)


        strokeWeight(5)
        stroke(25)
        text(label == 0 ? 0 : label.toFixed(numDecimals), firstVerticalLine + i * gridScale * scale, originPos.y + 5)
    }

    textAlign(LEFT, CENTER)
    const horizontalLinesUntilOrigin = originPos.y / lineSpacing
    const firstHorizontalLine = horizontalLinesUntilOrigin % 1 * lineSpacing
    const numberHorizontalLines = Math.ceil(height / lineSpacing) + 1
    for (let i = 0; i < numberHorizontalLines; i++) {
        const label = -Math.ceil(i - horizontalLinesUntilOrigin) * gridScale

        strokeWeight(2)
        stroke(150)
        line(0, firstHorizontalLine + i * gridScale * scale, width, firstHorizontalLine + i * gridScale * scale)


        if (label !== 0) {
            strokeWeight(5)
            stroke(25)
            text(label.toFixed(numDecimals), originPos.x + 5, firstHorizontalLine + i * gridScale * scale)
        }
    }

    // render points
    noStroke()
    for (let i = 0; i < points.length; i++) {
        const p = points[i]
        strokeWeight(3)
        stroke(146, 255, 255)
        fill(0)

        const pointPos = graphPosToCanvasPos(p.pos)
        ellipse(pointPos.x, pointPos.y, 10)

        if (p.slope !== undefined) {
            const L = Math.sqrt(p.slope ** 2 + 1)
            const slopeLine = {
                x: 1 / L,
                y: -p.slope / L //negative because negative is up in canvas space
            }

            line(pointPos.x - 20 * slopeLine.x, pointPos.y - 20 * slopeLine.y, pointPos.x + 50 * slopeLine.x, pointPos.y + 50 * slopeLine.y)
            ellipse(pointPos.x + 50 * slopeLine.x, pointPos.y + 50 * slopeLine.y, 5)
        }
    }

    const pointsFormatted = formatPoints(points)

    if (pointsFormatted.length <= 1) { return } //only continue if points have been placed

    overUnderShader.setUniform("uSize", [width, height])
    overUnderShader.setUniform("uOrigin", [originPos.x, originPos.y])
    overUnderShader.setUniform("uScale", scale)
    overUnderShader.setUniform("uDegree", coefficients.length)
    overUnderShader.setUniform("uCoefficients", coefficients)
    functionCanvas.shader(overUnderShader)
    functionCanvas.rect(1, 1, 1, 1)


    edgeShader.setUniform("uSize", [width, height])
    edgeShader.setUniform("uTex", functionCanvas)
    functionCanvas.shader(edgeShader)
    functionCanvas.rect(1, 1, 1, 1)

    functionCanvasColor.clear()
    dilateShader.setUniform("uSize", [width, height])
    dilateShader.setUniform("uTex", functionCanvas)
    dilateShader.setUniform("uTime", t)
    functionCanvasColor.shader(dilateShader)
    functionCanvasColor.rect(1, 1, 1, 1)

    image(functionCanvasColor, 0, 0, width, height)
}

function graphPosToCanvasPos(point) {
    return { x: point.x * scale + originPos.x, y: -point.y * scale + originPos.y }
}

function canvasPosToGraphPos(point) {
    return { x: (point.x - originPos.x) / scale, y: (point.y - originPos.y) / -scale }
}

function nearestNiceNumber(number) {
    const place = Math.floor(Math.log10(number))

    return Math.round(number / (10 ** place)) * (10 ** place)
}

let points = []
class Point {
    constructor(x, y) {
        this.pos = { x: x, y: y }
        this.slope = undefined
    }
}

function addPoint() {
    points.push(new Point((mouseX - originPos.x) / scale, -(mouseY - originPos.y) / scale))
}

// turns the Point class into an array that's format for the polynomial solver
function formatPoints() {
    let output = []

    for (let i = 0; i < points.length; i++) {
        const p = points[i]
        output.push({ isDerivative: false, x: p.pos.x, y: p.pos.y })
        if (p.slope !== undefined) {
            output.push({ isDerivative: true, x: p.pos.x, y: p.slope })
        }
    }

    return output
}

document.addEventListener("keypress", function (event) {
    const k = event.key

    if (k == "c") { //add a point
        let isNearPoint = false

        for (let i = 0; i < points.length; i++) {
            const p = points[i]

            const pointCanvasPos = graphPosToCanvasPos(p.pos)
            const distToPoint = Math.sqrt((pointCanvasPos.x - mouseX) ** 2 + (pointCanvasPos.y - mouseY) ** 2)
            if (distToPoint < 20) {
                points.splice(i, 1)
                isNearPoint = true
            }
        }

        if (!isNearPoint) {
            addPoint()
        }

        updateInputsFromPoints(); calculateCoefficients(points)
    }

    else if (k == "s") { //show the ui element to control the slope of this point
        let nearestPoint = -1
        let nearestDistance = 10000

        for (let i = 0; i < points.length; i++) {
            const p = points[i]

            const pointCanvasPos = graphPosToCanvasPos(p.pos)
            const distToPoint = Math.sqrt((pointCanvasPos.x - mouseX) ** 2 + (pointCanvasPos.y - mouseY) ** 2)

            if (distToPoint < nearestDistance) {
                nearestPoint = i
                nearestDistance = distToPoint
            }
        }

        if (nearestDistance < 20) {
            points[nearestPoint].slope == undefined ? points[nearestPoint].slope = 0 : points[nearestPoint].slope = undefined
        }

        updateInputsFromPoints(); calculateCoefficients(points)
    }
})

function calculateCoefficients(points) {
    coefficients = vectorToArray(pointsToPolynomialParameters(formatPoints(points))).reverse() //updating the global
    updateCanvasDisplay()
}

function updateCanvasDisplay() {
    const d = document.getElementById("equationFrame").contentWindow.document.body
    d.innerHTML = ""

    const title = document.createElement("h2")
    title.innerText = "Equation"
    d.appendChild(title)

    const equationsHolder = document.createElement("div")
    equationsHolder.id = "equationsHolder"
    d.appendChild(equationsHolder)

    const pretty = document.createElement("p")
    pretty.innerText = coefficientsToDisplay(coefficients)
    equationsHolder.appendChild(pretty)

    const mathJax = document.createElement("p")
    mathJax.innerText = coefficientsToMathJax(coefficients)
    equationsHolder.appendChild(mathJax)
}

// updates the js points array using the input elements on the page
function updatePointsFromInputs() {
    const pointsElements = document.getElementById("inputsFrame").contentWindow.document.body.querySelectorAll("div")
    for (let i = 0; i < pointsElements.length; i++) {
        const inputs = pointsElements[i].querySelectorAll("input")
        points[i].pos.x = inputs[0].value
        points[i].pos.y = inputs[1].value
        points[i].slope = inputs[2].value == "" ? undefined : inputs[2].value
    }
}

// updates the input elements on the page using the js points array
function updateInputsFromPoints() {
    const d = document.getElementById("inputsFrame").contentWindow.document.body
    d.innerHTML = ""

    const title = document.createElement("h2")
    title.innerText = "Points"

    d.appendChild(title)

    for (let i = 0; i < points.length; i++) {
        const p = points[i]

        const e = document.createElement("div")
        e.classList.add("pointInput")
        d.appendChild(e)

        const xLabel = document.createElement("span")
        xLabel.innerText = "x: "
        e.appendChild(xLabel)
        const xInput = document.createElement("input")
        xInput.type = "number"
        xInput.style = "width: 85px; float:right"
        xInput.value = p.pos.x
        xInput.addEventListener("change", (event) => { updatePointsFromInputs(); calculateCoefficients(points) })
        e.appendChild(xInput)

        e.appendChild(document.createElement("br"))

        const yLabel = document.createElement("span")
        yLabel.innerText = "y: "
        e.appendChild(yLabel)
        const yInput = document.createElement("input")
        yInput.type = "number"
        yInput.style = "width: 85px; float:right"
        yInput.value = p.pos.y
        yInput.addEventListener("change", (event) => { updatePointsFromInputs(); calculateCoefficients(points) })
        e.appendChild(yInput)

        e.appendChild(document.createElement("br"))

        const slopeLabel = document.createElement("span")
        slopeLabel.innerText = "Slope: "
        e.appendChild(slopeLabel)
        const slopeInput = document.createElement("input")
        slopeInput.type = "number"
        slopeInput.style = "width: 85px; float:right"
        slopeInput.value = p.slope
        slopeInput.addEventListener("change", (event) => { updatePointsFromInputs(); calculateCoefficients(points) })
        e.appendChild(slopeInput)
    }
}

function vectorToArray(vector) {
    let output = []
    for (let i = 0; i < vector.entries.length; i++) {
        output.push(vector.entries[i][0])
    }
    return output
}

function coefficientsToDisplay(coefficients) {

    function styleAsExponent(number) {
        let output = ""

        const exponentCharacters = "⁰¹²³⁴⁵⁶⁷⁸⁹".split("") //an array containing all 10 digits in superscript

        let s = String(number).split("")
        for (let character of s) {
            output += exponentCharacters[Number(character)]
        }

        return output
    }


    let output = "y = "
    let terms = []
    for (let i = coefficients.length - 1; i >= 0; i--) {
        const c = coefficients[i]
        let thisTerm = String(c)
        if (i !== 0) { i == 1 ? thisTerm += `x` : thisTerm += `x${styleAsExponent(i)}` }
        terms.push(thisTerm)
    }

    output += terms[0]
    for (let i = 1; i < terms.length - 1; i++) {
        output += coefficients[terms.length - 1 - i] >= 0 ? "+" + terms[i] : terms[i]
    }
    output += coefficients[0] >= 0 ? "+" + terms[terms.length - 1] : terms[terms.length - 1]

    return output
}

function coefficientsToMathJax(coefficients) {
    let output = "f(x) = "
    let terms = []
    for (let i = coefficients.length - 1; i >= 0; i--) {
        const c = coefficients[i]
        let thisTerm = String(c)
        if (i !== 0) { i == 1 ? thisTerm += `x` : thisTerm += `x^{${i}}` }
        terms.push(thisTerm)
    }

    output += terms[0]
    for (let i = 1; i < terms.length - 1; i++) {
        output += coefficients[terms.length - 1 - i] >= 0 ? "+" + terms[i] : terms[i]
    }
    output += coefficients[0] >= 0 ? "+" + terms[terms.length - 1] : terms[terms.length - 1]

    // replacing e-10 with /cdot10^{-10}
    output = output.replace(/e-(\d+)/g, "\\cdot10^{-\$1}")

    return output
}
