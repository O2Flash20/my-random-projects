class Spring {
    constructor(a, b, restLength, strength) {
        this.a = a
        this.b = b
        this.restLength = restLength
        this.strength = strength
    }

    display() {
        stroke(255)
        strokeWeight(3)
        line(this.a.pos.x, this.a.pos.y, this.b.pos.x, this.b.pos.y)
    }

    calculateForce() {
        const dist = max(this.a.pos.dist(this.b.pos) - this.restLength, 0)

        let force = this.strength * dist

        const angle = Math.atan2(
            (this.a.pos.y - this.b.pos.y),
            (this.a.pos.x - this.b.pos.x)
        )

        if (!this.a.locked) {
            this.a.applyForce([
                -force * Math.cos(angle),
                -force * Math.sin(angle)
            ])
        }
        if (!this.b.locked) {
            this.b.applyForce([
                force * Math.cos(angle),
                force * Math.sin(angle)
            ])
        }
    }
}

// class Spring {
//     constructor(a, b, stiffness, damping, restLength) {
//         this.a = a
//         this.b = b
//         this.stiffness = stiffness
//         this.damping = damping
//         this.restLength = restLength
//     }

//     display() { line(this.a.x, this.a.y, this.b.x, this.b.y) }

//     calculateForce() {
//         const currentLength = this.calculateCurrentLength()
//         return this.stiffness * (currentLength - this.restLength) + this.damping * (currentLength - this.restLength)
//     }

//     calculateCurrentLength() {
//         const dx = this.a.x - this.b.x
//         const dy = this.a.y - this.b.y
//         return Math.sqrt(dx * dx + dy * dy)
//     }

//     applyForce() {
//         if (this.a.locked && this.b.locked) {
//             // Both points are locked, so do not apply any force
//             return
//         }

//         const force = this.calculateForce()
//         const dx = this.a.x - this.b.x
//         const dy = this.a.y - this.b.y
//         const angle = Math.atan2(dy, dx)

//         if (!this.a.locked) {
//             // Apply force to point "a"
//             this.a.x += force * Math.cos(angle)
//             this.a.y += force * Math.sin(angle)
//         }
//         if (!this.b.locked) {
//             // Apply force to point "b"
//             this.b.x -= force * Math.cos(angle)
//             this.b.y -= force * Math.sin(angle)
//         }
//     }
// }