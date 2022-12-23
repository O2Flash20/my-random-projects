const w = 15

let Particles = []
let Springs = []

const cWidth = 15
const cHeight = 15

function setup() {
    createCanvas(600, 400)

    for (let i = 0; i < cWidth; i++) {
        Particles[i] = new Array(cHeight)
        for (let j = 0; j < cHeight; j++) {
            Particles[i][j] = new Particle(i * w + 150, j * w + 50)
        }
    }

    for (let i = 0; i < cWidth; i++) {
        for (let j = 0; j < cHeight; j++) {

            if (i !== cWidth - 1) {
                Springs.push(new Spring(
                    Particles[i][j],
                    Particles[i + 1][j],
                    w,
                    0.5
                ))
            }

            if (j !== cHeight - 1) {
                Springs.push(new Spring(
                    Particles[i][j],
                    Particles[i][j + 1],
                    w,
                    0.5
                ))
            }

        }
    }

    Particles[0][0].lock()
    Particles[cWidth - 1][0].lock()
}

function draw() {
    background(51)

    for (let i = 0; i < cWidth; i++) {
        for (let j = 0; j < cHeight; j++) {
            p = Particles[i][j]
            p.update()
            p.applyForce([0, 0.1])
            p.applyForce([Math.sin(frameCount / 100) / 10, 0])
        }
    }

    for (s of Springs) {
        s.display()
        s.calculateForce()
    }
}

// make it 3d
// then do shadows using normals