const NumSlits = 4
const SlitSpacing = 7.60e-6
const SlitWidth = 2.54e-6
const DistToScreen = 1.25
const ScreenRange = 0.5 //how much you see to on each side of the screen before it restarts
const Wavelength = 405e-9
const TimePerSweep = 5 // how much time it takes to go over the whole screen range

const NumDiffractionPhasers = 30 //this should technically be infinity


const lengthInfoElt = document.getElementById("lengthInfo")

let phasersCanvasSize = 400

// let mainCanvas
let iCanvas
let dCanvas
let gCanvas
let startPos //will just be set once,  the center of the screen
function setup() {
    // mainCanvas = createCanvas(800, 400)

    iCanvas = createGraphics(phasersCanvasSize, phasersCanvasSize)
    dCanvas = createGraphics(phasersCanvasSize, phasersCanvasSize)

    gCanvas = createGraphics(2 * phasersCanvasSize, phasersCanvasSize)

    startPos = createVector(phasersCanvasSize / 2, phasersCanvasSize / 2)
}

let interferencePlot = []
let diffractionPlot = []

t = 0
function draw() {
    if (t>TimePerSweep) {
        t= 0
        interferencePlot=[]; diffractionPlot=[]
    }
    else {
        t+= deltaTime/1000
    }

    const ScreenPos = t * ScreenRange / TimePerSweep
    const AngularPos = Math.atan2(ScreenPos, DistToScreen)

    // ---------- INTERFERENCE ----------
    iCanvas.background(51)

    let iArrowPoints = [startPos]
    const iAngleDiff = 2 * Math.PI * SlitSpacing * Math.sin(AngularPos) / Wavelength //phi
    for (let i = 0; i < NumSlits; i++) {
        const thisAngle = -iAngleDiff * i
        iArrowPoints.push(getArrowEnd(iArrowPoints[i], (phasersCanvasSize / 2) / NumSlits, thisAngle))
    }

    iCanvas.stroke(255)
    iCanvas.strokeWeight(1)
    for (let i = 0; i < iArrowPoints.length - 1; i++) {
        arrow(iCanvas, iArrowPoints[i], iArrowPoints[i + 1])
    }

    iCanvas.stroke(255, 0, 0)
    iCanvas.strokeWeight(5)
    arrow(iCanvas, iArrowPoints[0], iArrowPoints[iArrowPoints.length - 1])

    const interferenceValue = iArrowPoints[0].dist(iArrowPoints[iArrowPoints.length - 1]) / (phasersCanvasSize / 2)

    interferencePlot.push({ x: ScreenPos, y: interferenceValue })

    // ---------- DIFFRACTION ----------
    dCanvas.background(51)

    let dPoints = [startPos]
    const dAngleDiff = 2 * Math.PI * SlitWidth * Math.sin(AngularPos) / Wavelength //this is sigma
    const dAngleDiffPerLine = dAngleDiff / (NumDiffractionPhasers - 1)
    for (let i = 0; i < NumDiffractionPhasers; i++) {
        const thisAngle = -dAngleDiffPerLine * i
        dPoints.push(getArrowEnd(dPoints[i], (phasersCanvasSize / 2) / NumDiffractionPhasers, thisAngle))
    }

    dCanvas.stroke(255)
    dCanvas.strokeWeight(1)
    for (let i = 0; i < dPoints.length - 2; i++) {
        headlessArrow(dCanvas, dPoints[i], dPoints[i + 1])
    }
    arrow(dCanvas, dPoints[dPoints.length - 2], dPoints[dPoints.length - 1])

    dCanvas.stroke(0, 255, 0)
    dCanvas.strokeWeight(5)
    arrow(dCanvas, dPoints[0], dPoints[dPoints.length - 1])

    const diffractionValue = dPoints[0].dist(dPoints[dPoints.length - 1]) / (phasersCanvasSize / 2)

    diffractionPlot.push({ x: ScreenPos, y: diffractionValue })

    // ---------- GRAPH ----------
    gCanvas.background(51)

    gCanvas.strokeWeight(1)
    gCanvas.stroke(255, 0, 0)
    for (let i = 0; i < interferencePlot.length - 1; i++) {
        const thisGraphPos = toGraphPos(interferencePlot[i])
        const nextGraphPos = toGraphPos(interferencePlot[i + 1])

        gCanvas.line(thisGraphPos.x, thisGraphPos.y, nextGraphPos.x, nextGraphPos.y)
        gCanvas.line(-thisGraphPos.x+gCanvas.width, thisGraphPos.y, -nextGraphPos.x+gCanvas.width, nextGraphPos.y)
    }

    gCanvas.stroke(0, 255, 0)
    for (let i = 0; i < diffractionPlot.length - 1; i++) {
        const thisGraphPos = toGraphPos(diffractionPlot[i])
        const nextGraphPos = toGraphPos(diffractionPlot[i + 1])

        gCanvas.line(thisGraphPos.x, thisGraphPos.y, nextGraphPos.x, nextGraphPos.y)
        gCanvas.line(-thisGraphPos.x+gCanvas.width, thisGraphPos.y, -nextGraphPos.x+gCanvas.width, nextGraphPos.y)
    }

    gCanvas.stroke(255, 255, 255)
    gCanvas.strokeWeight(5)
    for (let i = 0; i < Math.min(interferencePlot.length, diffractionPlot.length)-1; i++) {
        const thisIntensity = interferencePlot[i].y * diffractionPlot[i].y
        const thisGraphPos = toGraphPos({ x: interferencePlot[i].x, y: thisIntensity })

        const nextIntensity = interferencePlot[i + 1].y * diffractionPlot[i + 1].y
        const nextGraphPos = toGraphPos({ x: interferencePlot[i + 1].x, y: nextIntensity })

        gCanvas.line(thisGraphPos.x, thisGraphPos.y, nextGraphPos.x, nextGraphPos.y)
        gCanvas.line(-thisGraphPos.x+gCanvas.width, thisGraphPos.y, -nextGraphPos.x+gCanvas.width, nextGraphPos.y)
    }
}

function getArrowEnd(start, length, angle) {
    return createVector(start.x + length * Math.cos(angle), start.y + length * Math.sin(angle))
}

function arrow(canvas, start, end) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const length = start.dist(end)
    canvas.push()
    canvas.translate(start.x, start.y)
    canvas.rotate(angle)
    canvas.line(0, 0, length, 0)
    canvas.line(length, 0, length - (10), -(5))
    canvas.line(length, 0, length - (10), (5))
    canvas.pop()
}

function headlessArrow(canvas, start, end) {
    canvas.line(start.x, start.y, end.x, end.y)
}

function toGraphPos(point) {
    return {
        x: point.x / ScreenRange * (gCanvas.width / 2) + gCanvas.width / 2,
        y: gCanvas.height * (1 - point.y)
    }
}