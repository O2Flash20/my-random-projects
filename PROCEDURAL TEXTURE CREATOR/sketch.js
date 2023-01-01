const size = 600

const width = size * 3
const height = size * 3

function setup() {
    createCanvas(width, height)
}

let Test
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

    // let Smooth = new Layer(size, size)
    //     .smoothNoise(10, 1, 51)
    //     .mapColors(0, 255, [0, 0, 0], [0, 0, 30])

    // let Voro2 = new Layer(size, size)
    //     .cells(10, 6, 1)
    //     .invert()

    // for (let i = 0; i < 3; i++) {
    //     for (let j = 0; j < 3; j++) {
    //         blendMode(BLEND)
    //         image(Voro2.img, size * i, size * j)
    //         blendMode(SCREEN)
    //         image(Smooth.img, size * i, size * j)
    //     }
    // }

    Test = new Layer(size, size)
        .sdfShape(function (X, Y) {
            let vertices = [
                [0, 0],
                [100, 0],
                [100, 100]
            ]
            let polygon = (sdf.polygon(X, Y, vertices) - 10) * 200

            let rect = sdf.rectangle(X, Y, 200, 200, 100, 50) * 200

            return smoothMin(polygon, rect, 30000)
        })
        .drawTiled()

    // let SmoothNoise = new Layer(size, size)
    //     .smoothNoise(10, 1, 1)
    //     .drawTiled()

    noLoop()
}

const sdf = {
    circle(X, Y, posX, posY, radius) {
        return dist(posX, posY, X, Y) - radius
    },
    rectangle(X, Y, posX, posY, width, height) {
        let dX = Math.max(Math.abs(X - posX) - width, 0)
        let dY = Math.max(Math.abs(Y - posY) - height, 0)
        let d = Math.sqrt(dX * dX + dY * dY)
        return d + Math.min(Math.max(dX, dY), 0)
    },
    // vertices in an array of [x, y]
    // thanks to Inigo Quillez and chatGPT for this
    // there can be two consecutive identical vertices (this includes first-last), it is some automatically
    polygon(X, Y, vertices) {
        function dot(v1, v2) {
            return v1[0] * v2[0] + v1[1] * v2[1]
        }

        function sub(v1, v2) {
            return [v1[0] - v2[0], v1[1] - v2[1]]
        }

        function mul(v1, n) {
            return [v1[0] * n, v1[1] * n]
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(value, max))
        }

        let distanceSquared = dot(sub([X, Y], vertices[0]), sub([X, Y], vertices[0]))
        let sign = 1.0
        let j = vertices.length - 1
        for (let i = 0; i < vertices.length; i++) {
            let edge = sub(vertices[j], vertices[i])
            let toPoint = sub([X, Y], vertices[i])
            let projection = sub(toPoint, mul(edge, clamp(dot(toPoint, edge) / dot(edge, edge), 0.0, 1.0)))
            // console.log(edge)
            distanceSquared = Math.min(distanceSquared, dot(projection, projection))
            let conditions = [Y >= vertices[i][1],
            Y < vertices[j][1],
            edge[0] * toPoint[1] > edge[1] * toPoint[0]
            ]
            if (conditions.every(x => x) || conditions.every(x => !x)) sign *= -1.0
            j = i
        }
        return sign * Math.sqrt(distanceSquared)
    }
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

    sdfShape(sdfCode) {
        this.img.loadPixels()
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {

                let values = []
                for (let xi = -1; xi <= 1; xi++) {
                    for (let yi = -1; yi <= 1; yi++) {
                        let xj = x + this.w * xi
                        let yj = y + this.h * yi

                        values.push(sdfCode(xj, yj))
                    }
                }

                let brightness = min(values)

                if (!brightness) { this.img.set(x, y, color(100, 0, 0)) }
                else { this.img.set(x, y, brightness) }
            }
        }
        this.img.updatePixels()

        return this
    }

    voronoi(numberOfPoints, seed) {
        this.img.loadPixels()

        Math.seedrandom(seed)
        let Points = []
        for (let i = 0; i < numberOfPoints; i++) {

            const mult = 2
            Points.push([createVector(
                Math.random() * this.w,
                Math.random() * this.h
            ),
            Math.random() * 255])

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

        Math.seedrandom(seed)

        let Points = []
        for (let i = 0; i < numberOfPoints; i++) {
            Points.push(createVector(
                Math.random() * this.w,
                Math.random() * this.h
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
                            }

                        }
                    }

                }

                this.img.set(x, y, recordDist / Math.sqrt(this.w ** 2 + this.h ** 2) * 255 * exposure)
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

    smoothNoise(frequency, detail, seed) {
        Math.seedrandom(seed)

        this.img.loadPixels()

        const s = this.w

        // do some funky math on the octaves number so that you never get an error, detail is a number from 0 to 1
        const octaves = Math.floor(Math.log2((s * 2) / frequency) * detail)
        frequency /= s //make frequency independent of size

        // create an array
        const permutation = [...Array(s)].map((_, i) => i)
        // shuffle it
        permutation.sort(() => Math.random() - 0.5)
        // duplicate it so that it wraps around
        permutation.push(...permutation)

        // an array of a full rotation in radians, s long and ordered
        const dirs = [...Array(s)].map((_, a) => [Math.cos(a * 2.0 * Math.PI / s), Math.sin(a * 2.0 * Math.PI / s)])

        // one octave of noise
        function noise(x, y, period) {
            function surflet(gridX, gridY) {
                const distX = Math.abs(x - gridX)
                const distY = Math.abs(y - gridY)
                const polyX = 1 - 6 * distX ** 5 + 15 * distX ** 4 - 10 * distX ** 3
                const polyY = 1 - 6 * distY ** 5 + 15 * distY ** 4 - 10 * distY ** 3

                // randomizes the vectors using the permutation array
                const hashed = permutation[permutation[Math.floor(gridX) % period] + Math.floor(gridY) % period]
                // console.log(Math.floor(gridX) % period)
                const grad = (x - gridX) * dirs[hashed][0] + (y - gridY) * dirs[hashed][1]

                // returns a mix of the distance from the point to the nearest grid point
                // and a number based on the vector it's given
                return polyX * polyY * grad
            }

            const intX = Math.floor(x)
            const intY = Math.floor(y)

            // add surflets together
            return (
                surflet(intX + 0, intY + 0) +
                surflet(intX + 1, intY + 0) +
                surflet(intX + 0, intY + 1) +
                surflet(intX + 1, intY + 1)
            )
        }

        // different octaves of noise added together
        function fBm(x, y, period, octaves) {
            let val = 0
            for (let o = 0; o < octaves; o++) {
                val += 0.5 ** o * noise(x * 2 ** o, y * 2 ** o, period * 2 ** o)
            }
            return val
        }

        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                this.img.set(x, y, (fBm(x * frequency, y * frequency, Math.floor(this.w * frequency), octaves) + 1) / 2 * 255)
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

function smoothMin(a, b, k) {
    let h = Math.max(k - Math.abs(a - b), 0) / k
    return Math.min(a, b) - h * h * k * (1 / 4)
}

/*
add the different sdf functions
make the sdfs not rely on canvas size
Use uv coordinates?

MAKE SMOOTH NOISE NOT DEPEND ON SIZE

contrast

blur needs to take into account wrap-around

save original black and white generated image for color mapping

easy layer mixing

deformation

CAN NOW USE Math.seedrandom() to give Math.random a seed

make texture only be able to be squares for simplicity
*/

