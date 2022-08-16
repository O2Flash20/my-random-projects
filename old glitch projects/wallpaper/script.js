var r = document.querySelector(':root')
var rs = getComputedStyle(r)

function hexToRGBA(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    result = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    }
    return result
}

//canvas particles
let c = document.getElementById("backCanvas")
let ctx = c.getContext("2d")
c.height = 1080
c.width = 1920
ctx.shadowBlur = 15
ctx.globalCompositeOperation = "color-dodge"

let particlesOn = false

let loop
function setdown() {
    emitters.splice(0, 1)
    emitters.splice(0, 1)

    clearInterval(loop)

    ctx.clearRect(0, 0, c.width, c.height)
}

function setup() {
    emitters.push(new ParticleEmitter(100, 100, 1, 150))
    emitters.push(new ParticleEmitter(600, 500, 2, 150))

    loop = setInterval(draw, 32)
}

function draw() {
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.shadowColor = rs.getPropertyValue('--main')

    if (Math.random() < 0.005) {
        emitters[1].applyForce([(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5])
    }

    if (particlesOn) {
        emitters[0].pos[0] = mousePos.x
        emitters[0].pos[1] = mousePos.y

        if (mouseDown) {
            emitters[0].emit()
        }
        emitters[0].update()

        emitters[1].emit()
        emitters[1].update()

        for (let i = 0; i < emitters[0].particles.length; i++) {
            emitters[0].particles[i].applyForce([0, 0.2])
        }
        for (let i = 0; i < emitters[0].particles.length; i++) {
            if (!emitters[0].particles[i].initialForce) {
                emitters[0].particles[i].applyForce([(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5])
                emitters[0].particles[i].initialForce = true
            }
        }


        for (let i = 0; i < emitters[1].particles.length; i++) {
            emitters[1].particles[i].applyForce([Math.random() - 0.5, Math.random() - 0.5])
        }
    }
}

let emitters = []
function ParticleEmitter(x, y, number, lifeTime) {
    this.pos = [x, y]
    this.vel = [0, 0]
    this.acc = [0, 0]

    this.applyForce = function (force) {
        this.acc[0] += force[0]
        this.acc[1] += force[1]
    }

    this.particles = []
    this.emit = function () {
        for (let i = 0; i < number; i++) {
            this.particles.push(new Particle(this.pos[0], this.pos[1]))
        }
    }
    this.update = function () {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update()
            this.particles[i].show()

            if (this.particles[i].life > lifeTime) {
                this.particles.splice(i, 1)
            }
        }

        if (this.vel[0] + this.vel[1] > 5) {
            this.vel[0] -= 0.1
            this.vel[1] -= 0.1
        }

        this.vel[0] += this.acc[0]
        this.vel[1] += this.acc[1]

        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1]

        this.acc = [0, 0]

        if (this.pos[0] < 0) {
            this.pos[0] = innerWidth
        }
        if (this.pos[0] > innerWidth) {
            this.pos[0] = 0
        }
        if (this.pos[1] < 0) {
            this.pos[1] = innerHeight
        }
        if (this.pos[1] > innerHeight) {
            this.pos[1] = 0
        }
    }
}

function Particle(x, y) {
    this.pos = [x, y]
    this.vel = [0, 0]
    this.acc = [0, 0]

    this.applyForce = function (force) {
        this.acc[0] += force[0]
        this.acc[1] += force[1]
    }

    this.update = function () {
        this.vel[0] += this.acc[0]
        this.vel[1] += this.acc[1]

        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1]

        this.acc = [0, 0]

        this.life++

        if (this.pos[0] < 0) {
            this.vel[0] *= -0.5
        }
        if (this.pos[0] > innerWidth) {
            this.vel[0] *= -0.5
        }
        if (this.pos[1] < 0) {
            this.vel[1] *= -0.5
        }
        if (this.pos[1] > innerHeight) {
            this.vel[1] *= -0.5
        }
    }

    this.update = function () {
        this.vel[0] += this.acc[0]
        this.vel[1] += this.acc[1]

        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1]

        this.acc = [0, 0]

        this.life++

        if (this.pos[0] < 0) {
            this.vel[0] *= -0.5
        }
        if (this.pos[0] > innerWidth) {
            this.vel[0] *= -0.5
        }
        if (this.pos[1] < 0) {
            this.vel[1] *= -0.5
        }
        if (this.pos[1] > innerHeight) {
            this.vel[1] *= -0.5
        }
    }

    this.show = function () {
        let main = hexToRGBA(rs.getPropertyValue('--main'))
        ctx.strokeStyle = `rgba(${main.r}, ${main.g}, ${main.b}, ${main.a - this.life / 150})`
        ctx.lineWidth = 1
        circle(this.pos[0], this.pos[1], 10)
    }

    this.life = 0
}

function circle(x, y, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.stroke()
}


function toggleParticles() {
    if (particlesOn) {
        particlesOn = false
        setdown()
    } else {
        particlesOn = true
        setup()
    }
}

//scroll detection
let oldValue = 0
let newValue = 0
window.addEventListener('scroll', (e) => {
    newValue = window.pageYOffset
    if (oldValue < newValue) {
        particlesUp()
    } else if (oldValue > newValue) {
        particlesDown()
    }
    oldValue = newValue
})
function particlesUp() {
    for (let i = 0; i < emitters.length; i++) {
        for (let a = 0; a < emitters[i].particles.length; a++) {
            emitters[i].particles[a].applyForce([0, -0.5])
        }
    }
}
function particlesDown() {
    for (let i = 0; i < emitters.length; i++) {
        for (let a = 0; a < emitters[i].particles.length; a++) {
            emitters[i].particles[a].applyForce([0, 0.5])
        }
    }
}

//getting the mouse position
let mousePos = { x: undefined, y: undefined }
document.addEventListener('mousemove', logKey)
function logKey(e) {
    mousePos.x = e.clientX
    mousePos.y = e.clientY
}

//when the mouse is down
let mouseDown = false
document.addEventListener('mousedown', MouseDown)
function MouseDown(e) {
    mouseDown = true
}
document.addEventListener('mouseup', MouseUp)
function MouseUp(e) {
    mouseDown = false
}


// just the background
function bg() {
    for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i].id !== "backCanvas") {
            document.body.children[i].style.visibility = "hidden"
        }
    }
}

toggleParticles()