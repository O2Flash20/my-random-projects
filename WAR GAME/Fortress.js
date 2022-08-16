class Fortress {
    constructor(x, y, num) {
        this.pos = createVector(x, y)
        this.num = num
    }

    draw() {
        fill(0, 0, 255)
        ellipse(this.pos.x, this.pos.y, 50, 50)
        textAlign(CENTER)
        textSize(20)
        fill(0)
        text(this.num, this.pos.x, this.pos.y + 8)
    }
}