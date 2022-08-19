class Boundary {
    constructor(x1, y1, x2, y2, texture) {
        this.a = createVector(x1, y1)
        this.b = createVector(x2, y2)

        // a string
        this.texture = texture
    }

    show() {
        stroke(this.color)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }

    getTextureColumn(x) {
        return this.texture.get(x, 0, 1, this.texture.height)
    }
}