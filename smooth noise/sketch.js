let layers = []
const numLayers = 6

const width = 700
const height = 500

function setup() {
    createCanvas(width, height)
    noStroke()
    for (let i = 0; i < numLayers; i++) {
        if (i == 0) {
            layers.push(createGraphics(width, height))
        } else {
            layers.push(createGraphics(width / (2 ** i), height / (2 ** i)))
        }

        layers[i].noStroke()

        for (let x = 0; x < layers[i].width; x++) {
            for (let y = 0; y < layers[i].height; y++) {
                layers[i].fill(random(0, 255))
                layers[i].rect(x, y, 1, 1)
            }
        }
    }
    blendMode(HARD_LIGHT)
    noLoop()
}

function draw() {
    background(220)
    // image(layers[0], 0, 0)
    for (let i = 0; i < numLayers; i++) {
        image(layers[i], 0, 0, width, height)
    }
}
