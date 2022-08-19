class Boundary {
    constructor(x1, y1, x2, y2, color) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);

        this.color = color;
    }

    show() {
        stroke(this.color);
        line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}