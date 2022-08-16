const width = 40
const height = 30
const res = 10

let disp

function setup() {
    createCanvas(width * res, height * res)

    disp = [...Array(width)].map(e => Array(height).fill(color(51, 51, 51)))
}

function draw() {
    background(255)

    noStroke()
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            fill(disp[x][y])
            rect(x * res, y * res, res, res)
        }
    }
}

function pixel(x, y, color) {
    disp[x][y] = color
}

const img1 = [
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0]
]

const img2 = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0]
]

function drawImage(image, x, y) {
    let imgWidth = image.length
    let imgHeight = image[0].length

    for (let i = 0; i < imgWidth; i++) {
        for (let j = 0; j < imgHeight; j++) {
            let c
            if (image[i][j] == 1) {
                c = color(255, 255, 255)
            } else {
                c = color(0, 0, 0)
            }
            pixel(y + j, x + i, c)
        }
    }
}