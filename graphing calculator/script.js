const c = document.getElementById("grapher")
const ctx = c.getContext("2d")

let button = document.getElementById("enter")
button.addEventListener("click", readInput)

function readInput() {
    input = document.getElementById("input").value

    // x coefficient and exponent
    let output = []
    let expOutput = []
    for (let i = 0; i < input.length; i++) {
        if (input.charAt(i) == "x") {
            for (let j = i; j > 0; j--) {
                if (parseInt(input.charAt(j - 1))) {
                    output.push(input.charAt(j - 1))
                } else if (input.charAt(j - 1) == "+" || input.charAt(j - 1) == "-") {
                    output.push(input.charAt(j - 1))
                    break
                }
            }

            for (let j = i; j < input.length; j++) {
                if (parseInt(input.charAt(j + 1))) {
                    expOutput.push(input.charAt(j + 1))
                } else {
                    break
                }
            }
        }
    }

    let xCoeff = ""
    for (let i = output.length - 1; i >= 0; i--) {
        xCoeff = xCoeff + output[i]
    }
    if (xCoeff.length == 0) {
        xCoeff = "1"
    }
    xCoeff = parseInt(xCoeff)

    let xExp = ""
    for (let i = 0; i < expOutput.length; i++) {
        xExp = xExp + expOutput[i]
    }
    if (expOutput.length == 0) {
        xExp = "1"
    }
    xExp = parseInt(xExp)



    // y coefficient and exponent
    output = []
    expOutput = []
    for (let i = 0; i < input.length; i++) {
        if (input.charAt(i) == "y") {
            for (let j = i; j > 0; j--) {
                if (parseInt(input.charAt(j - 1))) {
                    output.push(input.charAt(j - 1))
                } else if (input.charAt(j - 1) == "+" || input.charAt(j - 1) == "-") {
                    output.push(input.charAt(j - 1))
                    break
                }
            }

            for (let j = i; j < input.length; j++) {
                if (parseInt(input.charAt(j + 1))) {
                    expOutput.push(input.charAt(j + 1))
                } else {
                    break
                }
            }
        }
    }

    let yCoeff = ""
    for (let i = output.length - 1; i >= 0; i--) {
        yCoeff = yCoeff + output[i]
    }
    // not ideal
    if (yCoeff.length < 2) {
        yCoeff = "1"
    }
    yCoeff = parseInt(yCoeff)

    let yExp = ""
    for (let i = 0; i < expOutput.length; i++) {
        yExp = yExp + expOutput[i]
    }
    if (expOutput.length == 0) {
        yExp = "1"
    }
    yExp = parseInt(yExp)



    // setting up the graph points
    ctx.rect(0, 0, c.width, c.height)
    ctx.fillStyle = "silver"
    ctx.fill()

    let graphPoints = [...Array(c.width)].map(e => Array(c.height).fill(0))
    for (let x = -c.width / 2; x < c.width / 2; x++) {
        for (let y = c.height / 2; y > -c.height / 2; y--) {

            if (xCoeff * x ** xExp + yCoeff * y ** yExp < 0) {
                graphPoints[x + c.width / 2][y + c.height / 2] = 1
            }

        }
    }

    // drawing the graph
    ctx.fillStyle = "black"
    for (let x = 0; x < c.width; x++) {
        for (let y = 0; y < c.height; y++) {
            if (y != c.height && x != c.width && y != 0 && x != 0) {
                if (graphPoints[x][y] == 1) {
                    if (graphPoints[x][y + 1] == 0 || graphPoints[x][y - 1] == 0 || graphPoints[x + 1][y] == 0 || graphPoints[x - 1][y] == 0) {
                        ctx.fillRect(x, c.height - y, 1, 1)
                    }
                }
            }
        }
    }
}