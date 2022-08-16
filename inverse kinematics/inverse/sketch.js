let tentacle = []
let base
const length = 7

function setup() {
    createCanvas(600, 400)

    tentacle[0] = new Segment(null, 300, 200, length, 0)
    for (let i = 1; i < 50; i++) {
        tentacle[i] = new Segment(tentacle[i - 1], null, null, length, 0)
    }

    base = createVector(width / 2, height)
}

function draw() {
    background(51)

    const total = tentacle.length
    const end = tentacle[total - 1]

    end.follow(mouseX, mouseY)

    for (let i = total - 2; i >= 0; i--) {
        tentacle[i].follow(tentacle[i + 1].a.x, tentacle[i + 1].a.y)
        tentacle[i].update()
    }

    tentacle[0].setA(base)

    for (let i = 1; i < total; i++) {
        tentacle[i].setA(tentacle[i - 1].b)
    }

    for (let i = 0; i < total; i++) {
        tentacle[i].show()
    }
}