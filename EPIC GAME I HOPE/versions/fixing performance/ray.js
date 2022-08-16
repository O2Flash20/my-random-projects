class Ray {
    constructor(pos, angle) {
        this.pos = pos
        this.dir = p5.Vector.fromAngle(angle)
    }

    setAngle(angle) {
        this.dir = p5.Vector.fromAngle(angle)
    }

    lookAt(x, y) {
        this.dir.x = x - this.pos.x
        this.dir.y = y - this.pos.y
        this.dir.normalize()
    }

    show() {
        stroke(255)
        push()
        translate(this.pos.x, this.pos.y)
        line(0, 0, this.dir.x * 10, this.dir.y * 10)
        pop()
    }

    cast(wall) {
        const x1 = wall.a.x
        const y1 = wall.a.y
        const x2 = wall.b.x
        const y2 = wall.b.y

        const x3 = this.pos.x
        const y3 = this.pos.y
        const x4 = this.pos.x + this.dir.x
        const y4 = this.pos.y + this.dir.y

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if (den == 0) {
            return [null, null]
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den
        if (t > 0 && t < 1 && u > 0) {
            const pt = createVector()
            pt.x = x1 + t * (x2 - x1)
            pt.y = y1 + t * (y2 - y1)

            const length = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
            const l = Math.abs((pt.x - x1) / (x1 - x2))
            const r = x1 - x2
            const k = pt.x - x1

            const textureX = ((length * l) % (textures[wall.texture].width))

            return [pt, textureX]

        } else {
            return [null, null]
        }
    }
}