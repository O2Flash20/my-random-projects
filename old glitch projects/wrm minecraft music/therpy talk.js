//the main function for the "talk to the website" page
function howAreYou() {
    var answer = prompt("How are you doing? (on a scale of 1-5)", "5")
    if (answer == 1) {
        var answer = prompt(
            "Oh no, that's too bad, would you like to talk about it? (yes or no)",
            "yes"
        )
        if (answer == "no") {
            alert("Ok, listen to Minecraft music though")
        }
        if (answer == "yes") {
            deleteThought()
        }
    }
    if (answer == 2) {
        var answer = prompt(
            "Just feel better. Just kidding, would you like to talk about it? (yes or no)",
            "yes"
        )
        if (answer == "no") {
            alert("Ok, listen to Minecraft music though")
        }
        if (answer == "yes") {
            deleteThought()
        }
    }

    if (answer == 3) {
        deleteThought2()
    }

    if (answer == "EEster eGG") {
        easterEgg()
    }

    if (answer == "virus") {
        function downloadFile(data, fileName, type = "text/plain") {
            // Create an invisible A element
            const a = document.createElement("a")
            a.style.display = "none"
            document.body.appendChild(a)

            // Set the HREF to a Blob representation of the data to be downloaded
            a.href = window.URL.createObjectURL(
                new Blob([data], { type })
            )

            // Use download attribute to set set desired file name
            a.setAttribute("download", fileName)

            // Trigger the download by simulating click
            a.click()

            // Cleanup
            window.URL.revokeObjectURL(a.href)
            document.body.removeChild(a)
        }
        downloadFile("hello there", "TotallyNotAVirus.exe", "text")
    }

    if (answer == 4) {
        var answer = prompt("")
    }

    if (answer == 5) {
        answer = prompt(
            "EPECC. Since you're already doing so well, you wanna listen to pigstep? (yes or no)",
            "yes"
        )
        if (answer == "yes") {
            var selectedSong = document.getElementById("pigstep")
            selectedSong.play()
        }

        if (answer == "no") {
            alert("That's too bad, its a great song.")
        }
    }
}

//the main deleted thought function
function deleteThought() {
    var destoryThis = prompt(
        "What is it that is bothering you? (write anything you want, it won't be saved)",
        "sand: it's rough, course, and irritating"
    )
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.innerHTML = destoryThis
    setTimeout(crossOut, 2000)
    setTimeout(crossOutRed, 4000)
    setTimeout(crossOutUnRed, 5000)
    setTimeout(crossOutGray, 6000)
    setTimeout(crossOutUnGray, 6500)
    setTimeout(crossOutGray, 7000)
    setTimeout(crossOutUnGray, 7500)
    setTimeout(crossOutGray, 8000)
    setTimeout(crossOutUnGray, 8500)
    setTimeout(crossOutGray, 9000)
    setTimeout(crossOutUnGray, 9500)
    setTimeout(crossOutHide, 10500)
    setTimeout(thoughtDestroyedMessage, 11000)
    setTimeout(UnCrossOut, 11111)
    setTimeout(crossOutUnHide, 11500)
    setTimeout(crossOutHide, 13500)
}

//Another deleted thought function
function deleteThought2() {
    var destoryThis2 = prompt(
        "I guess it's an average day, but that doesn't mean you shouldn't listen to Minecraft music. If y ou have any thoughts you want to get out of your system, write them here. (write anything you want, it won't be saved)",
        "sand: it's rough, course, and irritating"
    )
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.innerHTML = destoryThis2
    setTimeout(crossOut, 2000)
    setTimeout(crossOutRed, 4000)
    setTimeout(crossOutUnRed, 5000)
    setTimeout(crossOutGray, 6000)
    setTimeout(crossOutUnGray, 6500)
    setTimeout(crossOutGray, 7000)
    setTimeout(crossOutUnGray, 7500)
    setTimeout(crossOutGray, 8000)
    setTimeout(crossOutUnGray, 8500)
    setTimeout(crossOutGray, 9000)
    setTimeout(crossOutUnGray, 9500)
    setTimeout(crossOutHide, 10500)
    setTimeout(thoughtDestroyedMessage, 11000)
    setTimeout(UnCrossOut, 11111)
    setTimeout(crossOutUnHide, 11500)
    setTimeout(crossOutHide, 13500)
}

function easterEgg() {
    alert(
        "Congragualtions!!! You have found the Easter Egg! You either can't spell or have too much time on your hands. Enjoy the surprise!"
    )
    var rickRollElement = document.getElementById("rickRoll")
    rickRollElement.classList.remove("hidden")
    rickRollElement.autoplay = true
    rickRollElement.load()
}

//the defining the different parts of the chain "animation" of the deleted thought
function crossOut() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.add("crossedOut")
}
function UnCrossOut() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.remove("crossedOut")
}
function crossOutRed() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.add("red")
}
function crossOutHide() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.add("hidden")
}
function crossOutUnHide() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.remove("hidden")
}
function crossOutUnRed() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.remove("red")
}
function thoughtDestroyedMessage() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.innerHTML = "Thought destroyed, have a nice day"
}
function crossOutGray() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.add("gray")
}
function crossOutUnGray() {
    var destroyThisElement = document.getElementById("destroyThis")
    destroyThisElement.classList.remove("gray")
}

setInterval(easterEggVolume, 7)

function easterEggVolume() {
    var rickRollElement = document.getElementById("rickRoll")

    /*
    if (rickRollElement.volume == 1){
      rickRollElement.volume = 0;
    }
    else{
      rickRollElement.volume = 1;
    }
    console.log(rickRollElement.volume);
    */

    rickRollElement.volume = Math.random()

    // rickRollElement.currentTime = Math.floor(Math.random() * 212);
}
