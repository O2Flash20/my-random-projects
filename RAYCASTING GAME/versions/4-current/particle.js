class Particle {
    constructor() {
        this.fov = 60
        this.res = this.fov / sceneW
        // this.res = 0.2
        this.pos = createVector(sceneW / 2, sceneH / 2)
        this.rays = []
        this.heading = 0
        for (let a = -this.fov / 2; a < this.fov / 2; a += this.res) {
            this.rays.push(new Ray(this.pos, radians(a)))
        }
    }

    updateFOV(fov) {
        this.fov = fov
        this.rays = []
        for (let a = -this.fov / 2; a < this.fov / 2; a += this.res) {
            this.rays.push(new Ray(this.pos, radians(a) + this.heading))
        }
    }

    rotate(angle) {
        this.heading += angle
        let index = 0
        for (let i = -this.fov / 2; i < this.fov / 2; i += this.res) {
            this.rays[index].setAngle(radians(i) + this.heading)
            index += 1
        }
    }

    move(amt) {
        const vel = p5.Vector.fromAngle(this.heading)
        vel.setMag(amt)
        this.pos.add(vel)
    }
    strafe(amt) {
        const vel = p5.Vector.fromAngle(this.heading + radians(90))
        vel.setMag(amt)
        this.pos.add(vel)
    }

    update(x, y) {
        this.pos.set(x, y)
    }

    look(walls) {
        const scene = []
        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i]
            let closest = null
            let record = Infinity
            let closestsTX = 0
            let closestWall = null

            let closestW

            let hitWall = false

            for (let wall of walls) {
                const pt = ray.cast(wall)[0]
                const tx = ray.cast(wall)[1]
                if (pt) {
                    hitWall = true
                    let d = p5.Vector.dist(this.pos, pt)
                    const a = ray.dir.heading() - this.heading
                    d *= cos(a)
                    if (d < record) {
                        record = d
                        closest = pt
                        closestsTX = tx
                        closestWall = wall
                    }
                }
            }

            if (closestWall) {
                scene[i] = [record, [closestsTX, closestWall.texture]]
            }
            else {
                scene[i] = null
            }

        }
        return scene
    }

    show() {
        fill(255)
        ellipse(this.pos.x, this.pos.y, 2)
        for (let ray of this.rays) {
            ray.show()
        }
    }
}
