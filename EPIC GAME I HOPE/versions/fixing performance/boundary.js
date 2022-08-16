class Boundary {
    constructor(x1, y1, x2, y2, texture) {
        this.a = createVector(x1, y1)
        this.b = createVector(x2, y2)

        // an index of "textures"
        this.texture = texture
    }

    show() {
        stroke(this.color)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }
}