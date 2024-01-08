let arm1Length = document.getElementById("arm1L")
let arm2Length = document.getElementById("arm2L")
let arm1Speed = document.getElementById("arm1S")
let arm2Speed = document.getElementById("arm2S")

let arm1Pi = document.getElementById("arm1Pi")
let arm2Pi = document.getElementById("arm2Pi")

let armsC

function setup() {
    createCanvas(800, 800)
    strokeWeight(0.5)

    armsC = createGraphics(width, height)
}

let lastEnd
function draw() {
    armsC.background(255)

    let arm1 = createVector(0, 1).setMag(parseInt(arm1Length.value))
    let arm2 = createVector(0, 1).setMag(parseInt(arm2Length.value))

    let piMult1 = 1
    if (arm1Pi.checked) {
        piMult1 = 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844
    }
    let piMult2 = 1
    if (arm2Pi.checked) {
        piMult2 = 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844
    }

    arm1.rotate(parseInt(arm1Speed.value) * piMult1 * frameCount / 50)
    arm2.rotate(parseInt(arm2Speed.value) * piMult2 * frameCount / 50)

    const w2 = width / 2
    const h2 = height / 2
    armsC.line(w2, h2, w2 + arm1.x, h2 + arm1.y)
    armsC.line(arm1.x + w2, arm1.y + h2, arm1.x + arm2.x + w2, arm1.y + arm2.y + h2)

    if (lastEnd) {
        line(lastEnd[0], lastEnd[1], arm1.x + arm2.x + w2, arm1.y + arm2.y + h2)
    }
    lastEnd = [arm1.x + arm2.x + w2, arm1.y + arm2.y + h2]
}

function restart() {
    background(255)
    lastEnd = null
}