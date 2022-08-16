function replaceAt(input, index, replacement) {
    let output = ""
    for (let i = 0; i < input.length; i++) {
        if (i == index) {
            output += replacement
        } else {
            output += input.charAt(i)
        }
    }
    return output
}


function letters(input) {
    let output = input
    for (let e = 0; e < input.length; e++) {
        //s
        if (output.charAt(e) == "s") {
            if (output.charAt(e + 1) == "s") {
                output = replaceAt(output, e, "")
            }
            else {
                output = replaceAt(output, e, "z")
            }
        }
        //ph
        if (output.charAt(e) == "p" && output.charAt(e + 1) == "h") {
            output = replaceAt(output, e, "")
            output = replaceAt(output, e, "f")
        }
        //c
        if (output.charAt(e) == "c") {
            if (output.charAt(e + 1) == ("e" || "y" || "i")) {
                output = replaceAt(output, e, "s")
            }
            else {
                output = replaceAt(output, e, "k")
            }
            if (output.charAt(e + 1) == "k") {
                output = replaceAt(output, e + 1, "")
            }
        }
        //q
        if (output.charAt(e) == "q") {
            output = replaceAt(output, e, "k")
        }
        //g
        if (output.charAt(e) == "g" && output.charAt(e + 1) == ("e" || "i" || "y")) {
            output = replaceAt(output, e, "j")
        }
    }
    return output
}

//testing is a string is a vowel
function isVowel(input) {
    if (input == "a" || input == "e" || input == "i" || input == "o" || input == "u") {
        return true
    }
    else {
        return false
    }
}

//accents instead of "e"
function accents(input) {
    let output = input
    for (let i = 0; i < output.length; i++) {
        if (output.charAt(i) == "e") {
            for (let e = i - 1; e >= 0; e--) {
                console.log(output.charAt(e))
                if (isVowel(output.charAt(e))) {
                    output = replaceAt(output, e, "X")
                    break
                }
            }
        }
    }
    return output
}