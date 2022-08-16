//particleInformation
let pi = []

function createParticles(count, length, x, y) {
    let particleInstanceNumber = pi.length
    pi[particleInstanceNumber] = [new Array(count)]
    //set x and y momentum to random number
    for (let i = 0; i < count; i++) {
        pi[particleInstanceNumber][i] = [randomNumber(-500, 500) / 200, randomNumber(-500, 500) / 200]
        createElement("IMG", "particlesContainer", null, null, particleInstanceNumber + " " + i, "https://cdn.glitch.com/a08dd6cd-7123-4bd6-aee3-16b95a9c6e17%2Fparticel.png?v=1625341498522", null, "transform:rotate(90deg);width: 50px; position:absolute; right:" + x + "px;top:" + y + "px")
    }
    setTimeout(function clearParticles() {
        pi[particleInstanceNumber] = []
        for (let i = 0; i < count; i++) {
            document.getElementsByClassName(particleInstanceNumber)[0].remove()
        }
    }, length)
}

//moving the particles by their momentum
var moveParticles = setInterval(function moveParticles() {
    for (let a = 0; a < pi.length; a++) {
        for (let b = 0; b < pi[a].length; b++) {
            pi[a][b][1] += 0.05
            document.getElementsByClassName(a + " " + b)[0].style.right = parseInt(document.getElementsByClassName(a + " " + b)[0].style.right) + pi[a][b][0] + "px"
            document.getElementsByClassName(a + " " + b)[0].style.top = parseInt(document.getElementsByClassName(a + " " + b)[0].style.top) + pi[a][b][1] + "px"
            document.getElementsByClassName(a + " " + b)[0].style.transform = "rotate(" + parseInt(document.getElementsByClassName(a + " " + b)[0].style.transform.replace(/\D/g, '')) + pi[a][b][0] + "deg)"
        }
    }
}, 10)

function randomNumber(min, max) {
    return (Math.floor(Math.random() * (max + 1 - min))) + min
}

function createElement(type, containerId, innerHTML, id, classList, src, onclick, style) {
    var newElement = document.createElement(type)
    document.getElementById(containerId).appendChild(newElement)
    newElement.innerHTML = innerHTML
    newElement.id = id
    newElement.className = classList
    newElement.src = src
    newElement.onclick = onclick
    newElement.style = style
}  