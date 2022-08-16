class Legion {
    constructor(barracks, num) {
        this.barracks = barracks
        this.num = num
        this.pos = this.barracks.pos.copy()

        this.target = this.barracks.pos.copy().add(createVector(random(-100, 100), random(-100, 100)).normalize().mult(50))
    }
    draw() {
        const size = map(this.num, 0, 100, 25, 45)
        fill(0, 0, 255)
        ellipse(this.pos.x, this.pos.y, size, size)
        textAlign(CENTER)
        textSize((2 / 5) * size)
        fill(0)
        text(this.num, this.pos.x, this.pos.y + (4 / 25) * size)
    }

    setTarget(target) {
        this.target = target

    }
    move() {
        const moveSpeed = 2


        if (dist(this.pos.x, this.pos.y, this.target.x, this.target.y) > 5) {
            this.pos.add(this.target.copy().sub(this.pos).normalize().mult(moveSpeed))
        }

        for (let fort of forts) {
            if (this.target == fort.pos && dist(this.pos.x, this.pos.y, fort.pos.x, fort.pos.y) < 20) {
                fort.num += this.num
                this.num = 0
                legions.splice(this, 1)
            }
        }

        // AAAAAH
        for (let legion of legions) {
            if (legion !== this) {
                if (dist(this.target.x, this.target.y, legion.target.x, legion.target.y) < 1 && dist(this.pos.x, this.pos.y, legion.pos.x, legion.pos.y) < 20 && legion.num > 0 && this.num + legion.num <= 100) {
                    this.num += legion.num
                    legion.num = 0
                    // legions.splice(legion, 1)
                    // legions.num = NaN
                }
            }
        }
    }
}