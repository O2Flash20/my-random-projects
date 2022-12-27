const width = 600
const height = 600

function setup() {
    createCanvas(width, height)
}

let Grain
function draw() {
    background(0)
    noStroke()

    // let Cells = new Layer(16, 16)
    //     .cells(12, 40, 912)
    //     .mapColors(0, 255, [0, 95, 20], [0, 95, 75])

    // let Voro = new Layer(16, 16)
    //     .voronoi(20, 2, 912)

    // for (let i = 0; i < 3; i++) {
    //     for (let j = 0; j < 3; j++) {
    //         blendMode(BLEND)
    //         image(Cells.img, 16 * i, 16 * j)
    //         blendMode(OVERLAY)
    //         image(Voro.img, 16 * i, 16 * j)
    //     }
    // }

    Grain = new Layer(200, 200)
        .grain(10)
        .drawTiled()

    noLoop()
}

class Layer {
    constructor(width, height) {
        this.w = width
        this.h = height
        this.img = createImage(width, height)

        return this
    }

    draw() {
        image(this.img, 0, 0)
    }

    drawTiled() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                image(this.img, this.w * i, this.h * j)
            }
        }
    }

    voronoi(numberOfPoints, exposure, seed) {
        this.img.loadPixels()

        noiseSeed(seed)
        let Points = []
        for (let i = 0; i < numberOfPoints; i++) {

            const mult = 2
            Points.push([createVector(
                ((noise(i) * this.w) - this.w / 2) * mult + mult / 4,
                ((noise(i + 43985) * this.h) - this.w / 2) * mult + mult / 4
            ),
            (((noise(i + 12321) - 0.5) * exposure) + exposure / 4) * 255])

        }

        // loop over all pixels
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {

                let recordDist = Infinity
                let recordColor
                // loop over all points
                for (let i = 0; i < Points.length; i++) {

                    // turn the points into 9 adjacent tiles so that the texture connects on the edges
                    for (let j = -1; j <= 1; j++) {
                        for (let k = -1; k <= 1; k++) {

                            const thisDist = dist(Points[i][0].x + (this.w * j), Points[i][0].y + (this.h * k), x, y)
                            if (thisDist < recordDist) {
                                recordDist = thisDist
                                recordColor = Points[i][1]
                            }

                        }
                    }

                }

                this.img.set(x, y, recordColor)
            }
        }
        this.img.updatePixels()

        return this
    }

    cells(numberOfPoints, exposure, seed) {
        this.img.loadPixels()

        noiseSeed(seed)
        let Points = []
        for (let i = 0; i < numberOfPoints; i++) {

            const mult = 2
            Points.push(createVector(
                ((noise(i) * this.w) - this.w / 2) * mult + mult / 4,
                ((noise(i + 43985) * this.h) - this.w / 2) * mult + mult / 4
            ))

        }

        // loop over all pixels
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {

                let recordDist = Infinity
                let recordColor = 0
                // loop over all points
                for (let i = 0; i < Points.length; i++) {

                    // turn the points into 9 adjacent tiles so that the texture connects on the edges
                    for (let j = -1; j <= 1; j++) {
                        for (let k = -1; k <= 1; k++) {

                            const thisDist = dist(Points[i].x + (this.w * j), Points[i].y + (this.h * k), x, y)
                            if (thisDist < recordDist) {
                                recordDist = thisDist
                                recordColor = thisDist * exposure
                            }

                        }
                    }

                }

                this.img.set(x, y, recordColor)
            }
        }
        this.img.updatePixels()

        return this
    }

    grain(seed) {
        noiseSeed(seed)
        noiseDetail(100)
        this.img.loadPixels()

        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                this.img.set(x, y, noise(x / 10, y / 10) * 255)
            }
        }

        this.img.updatePixels()

        return this
    }

    // startColor and endColor are in [H, S, B]
    mapColors(startBrightness, endBrightness, startColor, endColor) {
        colorMode(HSB, 100)

        // loop over all pixels
        this.img.loadPixels()
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {

                let thisBrightness = this.img.get(x, y)
                thisBrightness = (thisBrightness[0] + thisBrightness[1] + thisBrightness[2]) / 3

                // if in the range
                if (startBrightness <= thisBrightness && thisBrightness <= endBrightness) {

                    const thisH = map(thisBrightness, startBrightness, endBrightness, startColor[0], endColor[0])
                    const thisS = map(thisBrightness, startBrightness, endBrightness, startColor[1], endColor[1])
                    const thisB = map(thisBrightness, startBrightness, endBrightness, startColor[2], endColor[2])

                    this.img.set(x, y, color(thisH, thisS, thisB))
                }
            }
        }
        this.img.updatePixels()

        colorMode(RGB, 255)
        return this
    }

    invert() {
        this.img.filter(INVERT)

        return this
    }

    posterize(amount) {
        this.img.filter(POSTERIZE, amount)
        return this
    }

    blur(amount) {
        this.img.filter(BLUR, amount)
        return this
    }

    threshold(amount) {
        this.img.filter(THRESHOLD, amount)
        return this
    }
}

/*
smooth noise (perlin-like) THAT TILES 
change the way the voronoi exposure works ??
contrast

blur needs to take into account wrap-around

exposure takes size into account

save original black and white generated image for color mapping

easy layer mixing
*/