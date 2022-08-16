let classes = [
    ["History", "French", "Gym", "Science", "Lunch", "English", "Math"],
    ["History", "Math", "French", "Lunch", "Science", "Science", "English"],
    ["Art", "English", "Math", "Science", "Lunch", "French", "Ethics"],
    ["History", "Gym", "English", "Lunch", "Science", "Math", "French"],
    ["History", "English", "Science", "Science", "Lunch", "French", "Math"],
    ["Art", "French", "Math", "Lunch", "Science", "English", "Ethics"]
]

let chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", ",", ".", ":", "!", "?", "/", "<", ">", "'", "(", ")", "{", "}", ";", "=", '"', "\n"]

function encode(input) {
    let output = ""
    for (let i = 0; i < input.length; i++) {
        var currentEncode = chars.indexOf(input.charAt(i))
        if (String(currentEncode).length < 2) {
            currentEncode = "0" + currentEncode
        }
        output += currentEncode
    }
    return output
}

function decode(input) {
    let output = ""
    for (let i = 0; i < input.length; i += 2) {
        var charInput = (input.charAt(i) + input.charAt(i + 1))
        output += chars[parseInt(charInput)]
    }
    return output
}

let cloud_notes

//loads up notes on page load
function loadNotes() {
    document.getElementById("notes").value = getCookie("notes")
}
loadNotes()

//saving notes for every key press
var area = document.querySelector('textarea')
area.addEventListener('input', function () {
    setCookie("notes", document.getElementById("notes").value, 365)
})

//sumbit the work entered
function submitWork() {
    let title = document.getElementById("newWorkTitle")
    let day = document.getElementById("newWorkDay")

    setCookie(Math.floor(Date.now() / 1000 / 60 / 60 / 24) + parseInt(day.value), title.value, 100, true)
}

//get the work for one day (not done)
function getWork(inXDays) {
    return getCookie(Math.floor(Date.now() / 1000 / 60 / 60 / 24) + inXDays)
}

//logs all the work chronologically
function getAllWork() {
    let today = Math.floor(Date.now() / 1000 / 60 / 60 / 24)
    for (let i = 0; i < 100; i++) {
        console.log("-")
        for (let e = 0; e < getCookie(today + i, true).length; e++) {
            console.log(getCookie(today + i, true)[e])
        }
    }
}

//setting a cookie, as an array on just string (true for array)
function setCookie(cname, cvalue, exdays, arrayMode) {
    const d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    let expires = "expires=" + d.toUTCString()
    if (arrayMode) {
        let cookieText = `${cname}=[`
        for (let i = 0; i < getCookie(cname, true).length; i++) {
            cookieText += `'${getCookie(cname, true)[i]}', `
        }
        cookieText += `'${encodeURIComponent(cvalue)}'];${expires};path=/`
        document.cookie = cookieText
    } else {
        document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";" + expires + ";path=/"
    }
}

//getting a cookie, as array or string (true for array)
function getCookie(cname, arrayMode) {
    let name = cname + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            if (arrayMode) {
                return eval(c.substring(name.length, c.length))
            } else {
                return c.substring(name.length, c.length)
            }
        }
    }
    return ""
}