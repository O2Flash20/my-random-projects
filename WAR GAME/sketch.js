let forts = []
let legions = []
function setup() {
    createCanvas(400, 400)
    forts.push(new Barracks(100, 100, 40))
    for (let i = 0; i < 10; i++) {
        legions.push(new Legion(forts[0], floor(random(1, 100))))
    }
    forts.push(new Fortress(300, 250, 10))
    // leg.target = createVector(200, 200)
}

function draw() {
    background(220)
    forts[0].draw()
    forts[1].draw()
    for (legion of legions) {
        legion.move()
        legion.draw()
    }
}

function allTo() {
    for (legion of legions) {
        legion.target = createVector(200, 250)
    }
}
