let originPos = { x: 500, y: 300 }
let scale = 100 //pixels per unit on the plane

let mouseIsDragging = false
let mousePos = { x: 0, y: 0 }

let pointsInfoDiv

function setup() {
    createCanvas(1000, 600)
    stroke("white")
    textSize(20)

    canvas.addEventListener('wheel', function (event) {
        const scaleMultiplier = 1 - event.deltaY / 1000
        scale *= scaleMultiplier //zoom in or out

        const originRelativeToCursor = { x: originPos.x - event.clientX, y: originPos.y - event.clientY }
        const originRelativeToCursorAfterScroll = { x: originRelativeToCursor.x * scaleMultiplier, y: originRelativeToCursor.y * scaleMultiplier }
        const newOrigin = { x: originRelativeToCursorAfterScroll.x + event.clientX, y: originRelativeToCursorAfterScroll.y + event.clientY }
        originPos = newOrigin
    })

    canvas.addEventListener("mousedown", function (event) {
        mouseIsDragging = true
    })
    canvas.addEventListener("mouseup", function (event) {
        mouseIsDragging = false
    })
    canvas.addEventListener("mouseleave", function (event) {
        mouseIsDragging = false
    })
    canvas.addEventListener("mousemove", function (event) {
        const mouseDp = { x: event.clientX - mousePos.x, y: event.clientY - mousePos.y }
        mousePos = { x: event.clientX, y: event.clientY }
        if (mouseIsDragging) {
            originPos = { x: originPos.x + mouseDp.x, y: originPos.y + mouseDp.y }
        }
    })

    pointsInfoDiv = createElement("div")
}

function draw() {
    background(25)

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
        stroke(255)
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
        stroke(255)
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
        stroke(255)
        fill(0)
        ellipse(p.pos.x * scale + originPos.x, -p.pos.y * scale + originPos.y, 10)
    }

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
        if (p.slope) {
            output.push({ isDerivative: true, x: p.pos.x, y: p.pos.y })
        }
    }

    return output
}

document.addEventListener("keypress", function (event) {
    const k = event.key

    if (k == "c") {
        let isNearPoint = false

        for (let i = 0; i < points.length; i++) {
            const p = points[i]
            const pointScreenPos = { x: p.pos.x * scale + originPos.x, y: -p.pos.y * scale + originPos.y }
            const distToPoint = Math.sqrt((pointScreenPos.x - mouseX) ** 2 + (pointScreenPos.y - mouseY) ** 2)
            if (distToPoint < 20) {
                points.splice(i, 1)
                isNearPoint = true
            }
        }

        if (!isNearPoint) {
            addPoint()
        }

    }
})

/*
TODO:
be able to drag points
make inputs for the exact coordinates of the points
have a handle for the slope at each points
compute the graph very often and draw it each frame
*/