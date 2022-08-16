playAnimation1()

//hiding all the animations
function hideAllAnimations() {
    var a1Element = document.getElementById("a1")
    a1Element.classList.add("hidden")

    var a2Element = document.getElementById("a2")
    a2Element.classList.add("hidden")

    var a3Element = document.getElementById("a3")
    a3Element.classList.add("hidden")

    var a4Element = document.getElementById("a4")
    a4Element.classList.add("hidden")
}

//hiding all the animations then unhiding animation 1
function playAnimation1() {
    hideAllAnimations()
    var a1Element = document.getElementById("a1")
    a1Element.classList.remove("hidden")
}

//hiding all the animations then unhiding animation 2
function playAnimation2() {
    hideAllAnimations()
    var a2Element = document.getElementById("a2")
    a2Element.classList.remove("hidden")
}

//hiding all the animations then unhiding animation 3
function playAnimation3() {
    hideAllAnimations()
    var a3Element = document.getElementById("a3")
    a3Element.classList.remove("hidden")
}

function playAnimation4() {
    hideAllAnimations()
    var a4Element = document.getElementById("a4")
    a4Element.classList.remove("hidden")
}

//playing a random animation
function randomAnimation() {
    var selectedSong = Math.floor((Math.random() * 4) + 1)
    console.log(selectedSong)
}
