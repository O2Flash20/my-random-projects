// forearms/calves?
let stickMan = {}

function setup() {
    createCanvas(400, 400)

    stickMan = {
        head: new Segment(),
        torso: new Segment(),
        armR: new Segment(),
        armL: new Segment(),
        legR: new Segment(),
        legL: new Segment()
    }
}

function draw() {
    background(220)
}
