class Entity {
    constructor(pos, size) {
        this.pos = pos
        this.size = size
        this.vel = createVector(0, 0)
        this.acc = createVector(0, 0)

        this.widthToHeightRatio = this.size.x / this.size.y
    }

    applyForce(force) {
        this.acc.add(force)
    }

    update() {
        // for (let j = 0; j < 10; j++) {

        let pixelsTouched = []
        for (let x = -this.size.x / 2; x <= this.size.x / 2; x++) {
            for (let y = -this.size.y / 2; y <= this.size.y / 2; y++) {
                const pixelPos = createVector(x, y)
                    .add(createVector(Math.floor(this.pos.x), Math.floor(this.pos.y)))

                // if this pixel exists
                if (Structure[pixelPos.x] && Structure[pixelPos.x][pixelPos.y]) {
                    // and it's in the hitbox
                    if (createVector(x, y * this.widthToHeightRatio).mag() <= this.size.x) {
                        pixelsTouched.push([x, y])
                    }
                }
            }
        }

        if (pixelsTouched.length > 1) {

            let avgCollisionPos = [0, 0]
            for (let i = 0; i < pixelsTouched.length; i++) {
                avgCollisionPos[0] += pixelsTouched[i][0]
                avgCollisionPos[1] += pixelsTouched[i][1]
            }
            avgCollisionPos[0] /= pixelsTouched.length
            avgCollisionPos[1] /= pixelsTouched.length

            let normalForce = createVector(avgCollisionPos[0], avgCollisionPos[1] * this.widthToHeightRatio).mult(-1).normalize()

            if (this.acc.x > this.acc.y) {
                normalForce.mult(Math.abs(this.acc.x / normalForce.x))
            } else {
                normalForce.mult(Math.abs(this.acc.y / normalForce.y))
            }

            // normalForce.mult(2)

            console.log(normalForce)

            this.applyForce(normalForce)

            this.vel.set(0, 0)

        }

        // }


        // console.log(this.acc)

        this.vel.add(this.acc)
        this.pos.add(this.vel)

        this.acc = createVector(0, 0)
    }
}