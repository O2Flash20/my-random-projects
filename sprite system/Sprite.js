class Sprite {
    constructor(pos, img, width, height) {
        this.pos = pos
        this.img = img
        this.width = width
        this.height = height
    }

    draw() {
        image(this.img, this.pos.x, this.pos.y, this.width, this.height)
    }

    generateMask(res) {
        let grid = [...Array(floor(this.width / res))].map(e => Array(floor(this.height / res)).fill(0))

        for (let x = 0; x < floor(this.width / res); x++) {
            for (let y = 0; y < floor(this.height / res); y++) {
                const xPos = x * (this.img.width / this.width) * res
                const yPos = y * (this.img.height / this.height) * res
                const c = this.img.get(xPos, yPos)
                if (c[3] !== 0) {
                    grid[x][y] = 1
                }
            }
        }
        return grid
    }

    // option to get average collision point
    // direction
    pixelCollision(other, downRes) {
        const thisMask = this.generateMask(downRes)
        const otherMask = other.generateMask(downRes)

        for (let x = 0; x < thisMask.length; x++) {
            for (let y = 0; y < thisMask[0].length; y++) {
                if (otherMask[x + floor(this.pos.x / downRes - other.pos.x / downRes)]) {
                    if (otherMask[x + floor(this.pos.x / downRes - other.pos.x / downRes)][y + floor(this.pos.y / downRes - other.pos.y / downRes)]) {
                        if (thisMask[x][y] == 1 && otherMask[x + floor(this.pos.x / downRes - other.pos.x / downRes)][y + floor(this.pos.y / downRes - other.pos.y / downRes)] == 1) {
                            return true
                        }
                    }
                }
            }
        }
        return false
    }
    circleCollision(other, thisR, otherR, isCentered) {
        if (isCentered) {
            return (this.pos.x - other.pos.x) ** 2 + (this.pos.y - other.pos.y) ** 2 <= (thisR ** 2 + otherR ** 2)
        } else {
            return ((this.pos.x + this.width / 2) - (other.pos.x + other.width / 2)) ** 2 + ((this.pos.y + this.height / 2) - (other.pos.y + other.height / 2)) ** 2 <= (thisR ** 2 + otherR ** 2)
        }
    }
    rectCollision(other) {
        const thisVertices = [[this.pos.x, this.pos.y], [this.pos.x + this.width, this.pos.y + this.height], [this.pos.x, this.pos.y + this.height], [this.pos.x + this.width, this.pos.y]]
        const otherVertices = [[other.pos.x, other.pos.y], [other.pos.x + other.width, other.pos.y + other.height], [other.pos.x, other.pos.y + other.height], [other.pos.x + other.width, other.pos.y]]

        for (let pos of thisVertices) {
            if (pos[0] < other.pos.x + other.width && pos[0] > other.pos.x) {
                if (pos[1] < other.pos.y + other.height && pos[1] > other.pos.y) {
                    return true
                }
            }
        }
        for (let pos of otherVertices) {
            if (pos[0] < this.pos.x + this.width && pos[0] > this.pos.x) {
                if (pos[1] < this.pos.y + this.height && pos[1] > this.pos.y) {
                    return true
                }
            }
        }
        return false
    }
    // CIRCLE TO RECT COLLISION

}