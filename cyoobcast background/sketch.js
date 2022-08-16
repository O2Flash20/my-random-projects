let noiseLayer
let reverse = false

function setup() {
    createCanvas(1920, 1080)
    angleMode(DEGREES)
    noStroke()
}

let stars = []
function draw() {
    background(10, 0, 10, 10)
    translate(width / 2, height / 2)

    if (!reverse) {
        if (frameCount % 1 == 0) {
            createStar()
        }

        while (stars.length > 1000) {
            stars.splice(0, 1)
        }

        for (let star of stars) {
            star[0] += star[3]
            fill(star[4][0], star[4][1], star[4][2])
            ellipse(sin(star[1]) * star[0], cos(star[1]) * star[0], star[2], star[2])

            star[1] += 0.1
        }
    } else {
        for (let star of stars) {
            star[0] -= star[3] * 3
            // star[0] += star[3]
            fill(star[4][0], star[4][1], star[4][2])
            ellipse(sin(star[1]) * star[0], cos(star[1]) * star[0], star[2], star[2])

            star[1] += 0.7

            if (star[0] < 50) {
                star[0] = 50
            }
        }
    }


}

function createStar() {
    // dist, angle, size, speed, rgb
    stars.push([0, random(360), random(3, 10), random(1, 4), [random(128, 255), 0, random(128, 255)]])
}

document.onkeydown = function (e) {
    if (e.key == "r") {
        reverse = true
        setTimeout(function () {
            reverse = false
        }, 6000)
    }
}