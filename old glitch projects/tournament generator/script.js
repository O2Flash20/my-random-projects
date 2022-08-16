//random number generator
function randomNumber(min, max) {
    return Math.floor(Math.random() * max)
}

let input = []

//generating the brackets
function getBrackets() {

    const inputLength = input.length

    let output = []

    for (let i = 0; i < Math.ceil(input.length / 2); i++) {
        output.push([])
    }

    for (let i = 0; i < inputLength; i++) {
        let random = randomNumber(0, input.length)

        output[Math.floor(i / 2)].push(input[random])
        input.splice(random, 1)
    }
    displayOutput(output)
}

//inputting a participant
function inputParticipant() {
    if (document.getElementById("addParticipant").value !== "") {
        input.push(document.getElementById("addParticipant").value)
        document.getElementById("addParticipant").value = ""

        document.getElementById("participantDisplay").innerHTML = input
    }
}

//formatting the output
function displayOutput(input) {
    let output = ""
    for (let i = 0; i < input.length; i++) {
        if (i % 2 == 0) {
            output += "["
        }
        output += `[${input[i][0]} vs ${input[i][1]}]`
        if (i % 2 == 1) {
            output += "] "
        }
    }

    document.getElementById("bracketDisplay").innerHTML = output
}