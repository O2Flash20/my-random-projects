let originPos = { x: 500, y: 300 }
let scale = 100 //pixels per unit on the plane

let mouseIsDragging = false
let mousePos = { x: 0, y: 0 }

function setup() {
    createCanvas(1000, 600)
    stroke("white")
    textSize(20)
    textAlign(CENTER, TOP)

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
    canvas.addEventListener("mousemove", function (event) {
        const mouseDp = { x: event.clientX - mousePos.x, y: event.clientY - mousePos.y }
        mousePos = { x: event.clientX, y: event.clientY }
        if (mouseIsDragging) {
            originPos = { x: originPos.x + mouseDp.x, y: originPos.y + mouseDp.y }
        }
    })
}

function draw() {
    background(25)

    strokeWeight(7)
    line(originPos.x, 0, originPos.x, height)
    line(0, originPos.y, width, originPos.y)

    const numbersInterval = width / (scale * 10)
    const gridScale = nearestNiceNumber(numbersInterval)

    strokeWeight(2)
    const lineSpacing = gridScale * scale // spacing in pixels

    const verticalLinesUntilOrigin = originPos.x / lineSpacing
    const firstVerticalLine = verticalLinesUntilOrigin % 1 * lineSpacing
    const numberVerticalLines = Math.ceil(width / lineSpacing)
    for (let i = 0; i < numberVerticalLines; i++) {
        line(firstVerticalLine + i * gridScale * scale, 0, firstVerticalLine + i * gridScale * scale, height)
        const label = Math.ceil(i-verticalLinesUntilOrigin)*gridScale
        text(label, firstVerticalLine + i * gridScale * scale, originPos.y)
    }

    const horizontalLinesUntilOrigin = originPos.y/lineSpacing
    const firstHorizontalLine = horizontalLinesUntilOrigin%1*lineSpacing
    const numberHorizontalLines = Math.ceil(height/lineSpacing)
    for (let i = 0; i < numberHorizontalLines; i++) {
        line(0, firstHorizontalLine + i * gridScale * scale, width, firstHorizontalLine + i * gridScale * scale)
    }

}

function nearestNiceNumber(number) {
    const place = Math.floor(Math.log10(number))

    return Math.round(number / (10 ** place)) * (10 ** place)
}