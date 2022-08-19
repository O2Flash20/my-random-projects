class Entity {
    constructor(x, y, width, texture) {
        this.x = x
        this.y = y
        this.width = width
        this.texture = texture
    }

    getLine(playerX, playerY) {
        const x1 = playerX
        const y1 = playerY

        const x2 = this.x
        const y2 = this.y

        const a = (y2 - y1) / (x2 - x1)
        const angle = (Math.atan(a))

        const xOff = this.width * (Math.sin(angle))
        const yOff = this.width * (Math.cos(angle))


        return [createVector(x2 + xOff, y2 - yOff), createVector(x2 - xOff, y2 + yOff)]
    }
}