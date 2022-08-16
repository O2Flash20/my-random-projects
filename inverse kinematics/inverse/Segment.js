class Segment {
    constructor(parent, x, y, len, angle) {
        if (parent) {
            this.parent = parent
            this.a = parent.b.copy()
            this.len = len
            this.angle = angle
            this.b = createVector()

            this.calculateB()

        } else {
            this.parent = null
            this.a = createVector(x, y)
            this.len = len
            this.angle = angle
            this.b = createVector()

            this.calculateB()
        }
    }

    update() {
        this.calculateB()
    }

    follow(tx, ty) {
        let target = createVector(tx, ty)
        let dir = target.copy().sub(this.a)
        this.angle = dir.heading()

        dir.setMag(this.len)
        dir.mult(-1)

        this.a = target.copy().add(dir)
    }

    setA(pos) {
        this.a = pos.copy()
        this.calculateB()
    }

    calculateB() {
        const dx = this.len * cos(this.angle)
        const dy = this.len * sin(this.angle)
        this.b.set(this.a.x + dx, this.a.y + dy)
    }

    show() {
        stroke(255)
        strokeWeight(4)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }
}