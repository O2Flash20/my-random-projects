class Segment {
    constructor(parent, x, y, length, angle, t) {
        if (parent) {
            this.a = parent.b.copy()
            this.length = length
            this.angle = angle
            this.selfAngle = angle
            this.calculateB()
            this.parent = parent
        } else {
            this.a = createVector(x, y)
            this.length = length
            this.angle = angle
            this.selfAngle = angle
            this.calculateB()
            this.parent = null
        }
        this.t = t

        this.child
    }

    wiggle() {
        this.selfAngle = map(sin(this.t), -1, 1, -0.1, 0.1)
        this.t += 0.03
    }

    update() {
        this.angle = this.selfAngle
        if (this.parent) {
            this.a = this.parent.b.copy()
            this.angle += this.parent.angle
        } else {
            this.angle += -PI / 2
        }
        this.calculateB()
    }

    calculateB() {
        const dx = this.length * cos(this.angle)
        const dy = this.length * sin(this.angle)

        this.b = createVector(this.a.x + dx, this.a.y + dy)
    }

    show() {
        stroke(255)
        strokeWeight(4)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }
}