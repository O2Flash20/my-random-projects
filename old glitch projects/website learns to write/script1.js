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
    input = document.getElementById("input").value

    //gets the length of the input
    inputLength = input.length

    console.log(inputLength)
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
            output = ""
            //choose new random output
            for (currentRandomChar = 0; currentRandomChar < inputLength; currentRandomChar++) {
                //pick random characters and add them to the output
                output += characters.charAt(Math.floor(Math.random() * charactersLength))
            }
        }
        //display the output
        document.getElementById("output").innerHTML = output
    }
}