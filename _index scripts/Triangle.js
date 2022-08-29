class Triangle {
    constructor(p1, p2, p3) {
        this.vertices = [p1, p2, p3]
        this.edges = [[p1, p2], [p2, p3], [p1, p3]]
    }

    getCircumcircle() {
        const p1 = this.vertices[0]
        const p2 = this.vertices[1]
        const p3 = this.vertices[2]

        function lineFromPoints(P, Q) {
            let a = Q[1] - P[1]
            let b = P[0] - Q[0]
            let c = a * (P[0]) + b * (P[1])
            return [a, b, c]
        }
        function perpendicularBisectorFromLine(P, Q, a, b, c) {
            let mid_point = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]

            // c = -bx + ay
            c = -b * (mid_point[0]) + a * (mid_point[1])

            let temp = a
            a = -b
            b = temp
            return [a, b, c]
        }
        function lineLineIntersection(a1, b1, c1, a2, b2, c2) {
            let determinant = a1 * b2 - a2 * b1

            let x = (b2 * c1 - b1 * c2) / determinant
            let y = (a1 * c2 - a2 * c1) / determinant
            return [x, y]
        }

        function findCircumCenter(P, Q, R) {
            // Line PQ is represented as ax + by = c
            let PQ_line = lineFromPoints(P, Q)
            let a = PQ_line[0]
            let b = PQ_line[1]
            let c = PQ_line[2]

            // Line QR is represented as ex + fy = g
            let QR_line = lineFromPoints(Q, R)
            let e = QR_line[0]
            let f = QR_line[1]
            let g = QR_line[2]

            // Converting lines PQ and QR to perpendicular
            // bisectors. After this, L = ax + by = c
            // M = ex + fy = g
            let PQ_perpendicular = perpendicularBisectorFromLine(P, Q, a, b, c)
            a = PQ_perpendicular[0]
            b = PQ_perpendicular[1]
            c = PQ_perpendicular[2]

            let QR_perpendicular = perpendicularBisectorFromLine(Q, R, e, f, g)
            e = QR_perpendicular[0]
            f = QR_perpendicular[1]
            g = QR_perpendicular[2]

            // The point of intersection of L and M gives
            // the circumcenter
            let circumcenter = lineLineIntersection(a, b, c, e, f, g)

            return [circumcenter, dist(circumcenter[0], circumcenter[1], p1.x, p1.y)]
        }

        const c = findCircumCenter([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y])

        return { point: c[0], radius: c[1] }
    }

    draw() {
        const center = createVector((this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) / 3, (this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) / 3)
        stroke(51)
        const col = HSVtoRGB(map(center.y, 0, height, 150, 210), 1, 1)
        fill(col.r, col.g, col.b)
        beginShape(TRIANGLES)
        vertex(this.vertices[0].x, this.vertices[0].y)
        vertex(this.vertices[1].x, this.vertices[1].y)
        vertex(this.vertices[2].x, this.vertices[2].y)
        endShape()
    }
}