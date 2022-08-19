let blurShader

let c

let img1

const blurAmount = 10

let influenceMap

function preload() {
    blurShader = loadShader("blurShader.vert", "blurShader.frag")

    img1 = loadImage("test.png")
}

function setup() {
    createCanvas(400, 400, WEBGL)
    noStroke()

    c = createGraphics(400, 400)
    c.noStroke()

    influenceMap = generateInfluenceMap(blurAmount)

    setTimeout(singleDraw(), 100)
}

function draw() {
    background(220)

    c.image(img1, 0, 0, width, height)

    blurShader.setUniform("uTex", c)
    blurShader.setUniform("uRes", [width, height])
    blurShader.setUniform("uMap", influenceMap[0])
    blurShader.setUniform("uTotal", influenceMap[1])
    blurShader.setUniform("uMapRes", [blurAmount * 2 + 1, blurAmount * 2 + 1])

    shader(blurShader)
    rect(0, 0, width, height)

    // frameRate(0.1)
    noLoop()
}

function singleDraw() {
    background(220)

    c.image(img1, 0, 0, width, height)

    blurShader.setUniform("uTex", c)
    blurShader.setUniform("uRes", [width, height])
    blurShader.setUniform("uMap", influenceMap[0])
    blurShader.setUniform("uTotal", influenceMap[1])
    blurShader.setUniform("uMapRes", [blurAmount * 2 + 1, blurAmount * 2 + 1])

    shader(blurShader)
    rect(0, 0, width, height)
}

function generateInfluenceMap(amount) {
    let img = createImage(amount * 2 + 1, amount * 2 + 1)
    let totalValues = 0

    for (let i = 0; i < amount * 2 + 1; i++) {
        for (let j = 0; j < amount * 2 + 1; j++) {
            const x = i - amount
            const y = j - amount
            const val = (((0 - x ** 2 - y ** 2 - sqrt(x ** 2 + y ** 2)) / amount) + amount + 1) * (255 / amount + 1)

            totalValues += val
            img.loadPixels()
            img.pixels[(i * img.width + j) * 4] = val
            img.pixels[(i * img.width + j) * 4 + 1] = val
            img.pixels[(i * img.width + j) * 4 + 2] = val
            img.pixels[(i * img.width + j) * 4 + 3] = 255
            img.updatePixels()
        }
    }

    return [img, totalValues]
}

// blurAmount -> func -> setUniform (image and totalValues) -> Shader -> Loops through, proportion of influence texture2D/totalValues