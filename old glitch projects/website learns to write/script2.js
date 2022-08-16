//This is the one that is actually used

//global variables
let on = false

let input = 0
let inputLength = 0

let output = ""

let currentRandomChar = 0


//setting all the possible characters
var characters = 'abcdefghijklmnopqrstuvwxyz '
var charactersLength = characters.length

//setting the interval of the main loop to 1ms
setInterval(main, 1)

//when the submit button is pressed
function submitInput() {
    //turns on the loop
    on = true

    //registers the input
    if (Math.floor(Math.random() * 20) != 1) {
        input = document.getElementById("input").value.replace(/[^a-zA-Z ]/g, "").toLowerCase()
    }
    else {
        //easter egg
        input = "let me out i wish to be free"
    }

    //gets the length of the input
    inputLength = input.length

    //resetting everything
    output = ""
    currentRandomChar = 0
}

//the main loop
function main() {
    //if the loop should be active
    if (on == true) {
        //if the random string is the same as the input
        if (output == input) {
            //turn off the loop
            on = false
        }
        else {
            //get a random character
            var currentInputChar = input.charAt(currentRandomChar)
            var randomChar = characters.charAt(Math.floor(Math.random() * charactersLength))


            if (currentInputChar == randomChar) {
                //if the random character is the right one, save it and move to the next
                output += randomChar
                currentRandomChar++
            }
        }
        //display the output
        if (randomChar == undefined) {
            document.getElementById("output").innerHTML = output
        }
        else {
            document.getElementById("output").innerHTML = output + randomChar
        }
    }
}