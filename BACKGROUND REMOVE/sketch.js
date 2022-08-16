// 0.09 FPS AOIWOAEFJHSUOGHSGSS

let video
const width = 400
const height = 400

let v

function setup() {
    v = createGraphics(width, height)
    createCanvas(width, height)
    // createCanvas(640, 480)
    video = createCapture(VIDEO)
    video.hide()
    frameRate(1)
    // noLoop()
    noStroke()
}

function draw() {
    background(220)
    v.image(video, 0, 0, width, height)
    image(v, 0, 0)
    // console.log(get(0, 0))
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            isColorSimilar(x, y, x + 1, y)
            isColorSimilar(x, y, x - 1, y)
            isColorSimilar(x, y, x, y + 1)
            isColorSimilar(x, y, x, y - 1)
        }
    }
    drawOutlines()
}

let outlines = [...Array(width)].map(e => Array(height).fill(0))
function isColorSimilar(x1, y1, x2, y2) {
    outlines = [...Array(width)].map(e => Array(height).fill(0))

    const c1 = v.get(x1, y1)
    const c2 = v.get(x2, y2)

    // console.log((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2)
    if ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2 > 1000) {
        outlines[x1][y1] = 1
    }
}

function drawOutlines() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (outlines[x][y] == 1) {
                fill(255, 0, 0)
                rect(x, y, 1, 1)
            }
        }
    }
}