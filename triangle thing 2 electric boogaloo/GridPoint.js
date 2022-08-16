class GridPoint {
    constructor(x, y) {
        this.pos = createVector(x, y)
        this.vertices = [undefined, undefined, undefined]
    }

    draw() {
        fill(255, 0, 0)
        ellipse(this.pos.x, this.pos.y, 4, 4)
    }

    getVertices() {
        let vertices = []
        while (vertices.length < 3) {
            let recordDist = Infinity
            let recordIndex = -1
            for (let i = 0; i < pts.length; i++) {
                if (!vertices.includes(i)) {
                    const distance = dist(this.pos.x, this.pos.y, pts[i].x, pts[i].y)
                    const index = i
                    if (distance < recordDist) {
                        recordDist = distance
                        recordIndex = index
                    }
                }
            }
            vertices.push(recordIndex)
        }
        this.vertices = vertices
        return vertices
    }

    drawVertices() {
        stroke(0, 255, 255)
        line(pts[this.vertices[0]].x, pts[this.vertices[0]].y, pts[this.vertices[1]].x, pts[this.vertices[1]].y)
        line(pts[this.vertices[1]].x, pts[this.vertices[1]].y, pts[this.vertices[2]].x, pts[this.vertices[2]].y)
        line(pts[this.vertices[2]].x, pts[this.vertices[2]].y, pts[this.vertices[0]].x, pts[this.vertices[0]].y)
    }
}