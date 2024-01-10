function setup() {
    createCanvas(400, 400)
}

function draw() {
    background(220)
}


// the lower thetaIncrement and timeIncrement are, the more accurate the answer is
// it only "simulates" until timeMax. with an initial speed of 30, timeMax can be 1, but with higher speeds it might need to be turned up
function getAngle(forwardDistance, height, initialSpeed, terminalSpeed, gravity, thetaIncrement, timeIncrement, timeMax) {
    let lastSolutionTheta = 0
    for (let theta = 0; theta < 90; theta += thetaIncrement) {

        let timeReachesX //the time that the projectile gets to the desire position on the x-axis (forward)
        let lastXValue = 0
        for (let t = 0; t < timeMax; t += timeIncrement) {
            const thisX = initialSpeed * terminalSpeed * Math.cos(rad(theta)) * (1 - Math.exp(-gravity * t / terminalSpeed)) / gravity
            if (thisX > forwardDistance && lastXValue <= forwardDistance) {
                timeReachesX = map(forwardDistance, lastXValue, thisX, t - timeIncrement, t) //assume the intervals between the sample times are linear (they arent)
                break
            }
            lastXValue = thisX
        }


        // now, see what angle we would have to shoot the projectile at to get it to reach the target at the same time on the z-axis (upward). if the angle is the same to reach the target at the same time on both axes, its a solution
        const solutionTheta = deg(Math.asin(
            (((height + terminalSpeed * timeReachesX) * gravity) / ((1 - Math.exp(-gravity * timeReachesX / terminalSpeed)) * terminalSpeed) - terminalSpeed) / initialSpeed
        ))
        const lastTheta = theta - thetaIncrement
        if (lastTheta < lastSolutionTheta && theta >= solutionTheta) {
            console.log(timeReachesX)
            return (lastTheta * solutionTheta - theta * lastSolutionTheta) / (lastTheta - theta - lastSolutionTheta + solutionTheta) //estimates the angle that would work (for both x and z)
        }
        lastSolutionTheta = solutionTheta
    }

    return false
}

function rad(angle) {
    return Math.PI * angle / 180
}

function deg(angle) {
    return 180 * angle / Math.PI
}

function map(value, min1, max1, min2, max2) {
    return (value - min1) * ((max2 - min2) / (max1 - min1)) + min2
}