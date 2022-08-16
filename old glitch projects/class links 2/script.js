//dont want to write the whole thing anymore
function id(id) {
    return document.getElementById(id)
}

//setting a cookie
function setCookie(cname, cvalue, exdays, URI) {
    const d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    let expires = "expires=" + d.toUTCString()

    if (URI) {
        document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";" + expires + ";path=/"
    } else {
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
    }
}

//acquiring a cookie from cookie jar
function getCookie(cname, URI) {
    let name = cname + "="
    let decodedCookie
    if (URI) {
        decodedCookie = decodeURIComponent(document.cookie)
    } else {
        decodedCookie = document.cookie
    }
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

//eats a cookie
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

// set up classes
let table = document.getElementById("table")
for (let a = 1; a < table.children.length; a++) {
    for (let b = 1; b < table.children[a].children.length; b++) {
        table.children[a].children[b].children[0].classList.add(`row${a}`)
        table.children[a].children[b].children[0].classList.add(`column${b}`)
    }
}

//set up the array to store everything
let classes = []
for (let r = 0; r < 8; r++) {
    classes.push([])
    for (let c = 0; c < 6; c++) {
        classes[r].push([["-"], [null]])
    }
}

// to add a class
function addClass(name, link, row, column) {

    if (row > 2) {
        document.getElementsByClassName(`row${parseFloat(row) + 1} column${column}`)[0].innerHTML = name
        document.getElementsByClassName(`row${parseFloat(row) + 1} column${column}`)[0].href = link
        document.getElementsByClassName(`row${parseFloat(row) + 1} column${column}`)[0].target = "_blank"

        classes[row][column - 1][0] = name
        classes[row][column - 1][1] = link
    } else {
        document.getElementsByClassName(`row${row} column${column}`)[0].innerHTML = name
        document.getElementsByClassName(`row${row} column${column}`)[0].href = link
        document.getElementsByClassName(`row${row} column${column}`)[0].target = "_blank"

        classes[row - 1][column - 1][0] = name
        classes[row - 1][column - 1][1] = link
    }

    deleteCookie(classes)
    setCookie("classes", JSON.stringify(classes), 1000)
}

//loading the classes from the cookies
getClasses()
function getClasses() {
    if (getCookie("classes")) {
        classes = eval(getCookie("classes"))
    }

    for (let r = 1; r <= 8; r++) {
        for (let c = 1; c <= 6; c++) {
            document.getElementsByClassName(`row${r} column${c}`)[0].innerHTML = classes[r - 1][c - 1][0]
            document.getElementsByClassName(`row${r} column${c}`)[0].href = classes[r - 1][c - 1][1]
            document.getElementsByClassName(`row${r} column${c}`)[0].target = "_blank"
        }
    }
}

// notes area
var area = document.querySelector('textarea')
area.addEventListener('input', function () {
    setCookie("notes", document.getElementById("notes").value, 1000, true)
})

function loadNotes() {
    document.getElementById("notes").value = getCookie("notes", true)
}
loadNotes()

//time stuff
setInterval(function updateTime() {
    let d = new Date()
    let second = d.getSeconds()
    let minute = d.getMinutes()
    let hour = d.getHours()
    let day = d.getDay()

    if ((((hour == 9) && (minute == 2)) || ((hour == 10) && (minute == 2)) || ((hour == 11) && (minute == 7)) || ((hour == 12) && ((minute == 2) || (minute == 52))) || ((hour == 13) && (minute == 47)) || ((hour == 14) && (minute == 42))) && second <= 30) {
        playAlarm()
    }

    document.getElementById("time").innerHTML = `${hour % 12}:${twoDigit(minute)}:${twoDigit(second)}`

    // OH MY GOD I HATE LOOKING AT THIS
    if ((hour < 9) || ((hour == 9) && (minute < 5))) {
        var hourUntil = (9 - hour)
        var minuteUntil = (5 - minute)
        var secondUntil = (0 - second)
    }

    if (((hour == 9) && (minute > 4)) || ((hour == 10) && (minute < 6))) {
        var hourUntil = (10 - hour)
        var minuteUntil = (5 - minute)
        var secondUntil = (0 - second)
    }

    if (((hour == 10) && (minute > 4)) || ((hour == 11) && (minute < 11))) {
        var hourUntil = (11 - hour)
        var minuteUntil = (10 - minute)
        var secondUntil = (0 - second)
    }

    if (((hour == 11) && (minute > 9)) || ((hour == 12) && (minute < 6))) {
        var hourUntil = (12 - hour)
        var minuteUntil = (5 - minute)
        var secondUntil = (0 - second)
    }

    if (((hour == 12) && (minute > 5) && (minute < 56))) {
        var hourUntil = (12 - hour)
        var minuteUntil = (55 - minute)
        var secondUntil = (0 - second)
    }
    if (((hour == 12) && (minute > 55)) || (hour == 13) && (minute < 49)) {
        var hourUntil = (13 - hour)
        var minuteUntil = (50 - minute)
        var secondUntil = (0 - second)
    }
    if (((hour == 13) && (minute > 50)) || (hour == 14) && (minute < 46)) {
        var hourUntil = (14 - hour)
        var minuteUntil = (45 - minute)
        var secondUntil = (0 - second)
    }
    if (((hour == 14) && (minute > 45)) || hour > 14) {
        var hourUntil = (9 - hour)
        var minuteUntil = (5 - minute)
        var secondUntil = (0 - second)
    }

    if (hourUntil < 0) {
        hourUntil += 24
    }

    if (minuteUntil < 0) {
        hourUntil -= 1
        minuteUntil += 60
    }
    if (secondUntil < 0) {
        minuteUntil -= 1
        secondUntil += 60
    }

    document.getElementById("timeUntil").innerHTML = `The next class is in: ${hourUntil}:${twoDigit(minuteUntil)}:${twoDigit(secondUntil)}`
}, 1000)

//highlight by class
function highlight(cs) {
    for (let i = 0; i < document.getElementsByClassName(cs).length; i++) {

    }
}

//alarm
let alarmEnabled = true
function playAlarm() {
    if (alarmEnabled) {
        document.getElementById("alarm").play()
    } else {
        console.log("alarm disabled")
    }
}
function alarmToggle() {
    if (alarmEnabled) {
        alarmEnabled = false
        console.log("alarm disabled")
    } else {
        alarmEnabled = true
        console.log("alarm enabled")
    }
}

//put a 0 in front of somehting if its only one digit
function twoDigit(input) {
    if (String(input).length !== 1) {
        return input
    }
    else {
        return "0" + input
    }
}

//setting main and background colors
var r = document.querySelector(':root')
var rs = getComputedStyle(r)
function setMain(color) {
    r.style.setProperty('--main', color)
    //let shadow = hexToHSL()
    setCookie("main", color, 1000)
    id("mainColor").value = color
    setShadow()
}
function setBackground(color) {
    r.style.setProperty('--second', color)
    setCookie("background", color, 1000)
    id("backgroundColor").value = color
}

//library of themes
// we do a little json
let themes = {
    dark: {
        name: "Dark",
        main: "#FFFFFF",
        background: "#222222"
    },
    light: {
        name: "Light",
        main: "#000000",
        background: "#FFFFFF"
    },
    blue: {
        name: "Blue",
        main: "#00ccff",
        background: "#1a1c1e"
    }
}

//add a custom theme
function addTheme(name, main, background) {
    let object = {}
    object.name = name
    object.main = main
    object.background = background
    eval("themes." + name.replace(/\s/g, '') + "=object")
    saveThemes()
}
//remove a theme
function removeTheme(name) {
    eval("delete themes." + name.replace(/\s/g, ''))
    saveThemes()
}

//writing the themes to the page every time it loads
function displayThemes() {
    document.getElementById("themeList").innerHTML = ""
    for (let theme in themes) {
        let currentTheme = eval("themes." + theme)
        let element = document.createElement("li")
        element.innerHTML = currentTheme.name
        element.onclick = function () { applyTheme(currentTheme) }
        document.getElementById("themeList").appendChild(element)
    }
}
//save all themes to cookies
function saveThemes() {
    setCookie("themes", JSON.stringify(themes))
    displayThemes()
}

//using a theme
function applyTheme(theme) {
    setMain(theme.main)
    setBackground(theme.background)
}

//set the color from cookies
if (getCookie("main")) {
    setMain(getCookie("main"))
    setBackground(getCookie("background"))
} else {
    applyTheme(themes.dark)
}

//get the themes at page load
function getThemes() {
    console.log(getCookie("themes"))
    themes = JSON.parse(getCookie("themes"))
    displayThemes()
}
getThemes()

function toggleHidden(elementId) {
    let element = document.getElementById(elementId)
    if (element.style.display == "block") {
        element.style.display = "none"
        element.style.visibility = "hidden"
    } else {
        element.style.display = "block"
        element.style.visibility = "inherit"
    }
}

document.getElementById("classAdder").style.display = "none"

function hexToHSL(H, shadow) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0
    if (H.length == 4) {
        r = "0x" + H[1] + H[1]
        g = "0x" + H[2] + H[2]
        b = "0x" + H[3] + H[3]
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2]
        g = "0x" + H[3] + H[4]
        b = "0x" + H[5] + H[6]
    }
    // Then to HSL
    r /= 255
    g /= 255
    b /= 255
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0

    if (delta == 0)
        h = 0
    else if (cmax == r)
        h = ((g - b) / delta) % 6
    else if (cmax == g)
        h = (b - r) / delta + 2
    else
        h = (r - g) / delta + 4

    h = Math.round(h * 60)

    if (h < 0)
        h += 360

    l = (cmax + cmin) / 2
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
    s = +(s * 100).toFixed(1)
    l = +(l * 100).toFixed(1)


    if (l > 49) {
        l = l - 30
        h = h - 5
    } else if (l < 50) {
        l = l + 30
        h = h + 5
    }

    return "hsl(" + h + "," + s + "%," + l + "%)"
}

function hexToRGBA(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    result = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    }
    return result
}

function setShadow() {
    let shadow = hexToHSL(document.getElementById('mainColor').value)
    console.log(shadow)
    var r = document.querySelector(':root')
    r.style.setProperty('--shadow', shadow)
}

setShadow()





//canvas particles
let c = document.getElementById("backCanvas")
let ctx = c.getContext("2d")
c.height = 1080
c.width = 1920
ctx.shadowBlur = 15
ctx.globalCompositeOperation = "color-dodge"

let particlesOn = false

let loop
function setdown() {
    emitters.splice(0, 1)
    emitters.splice(0, 1)

    clearInterval(loop)

    ctx.clearRect(0, 0, c.width, c.height)
}

function setup() {
    emitters.push(new ParticleEmitter(100, 100, 1, 150))
    emitters.push(new ParticleEmitter(600, 500, 2, 150))

    loop = setInterval(draw, 32)
}

function draw() {
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.shadowColor = rs.getPropertyValue('--main')

    if (Math.random() < 0.005) {
        emitters[1].applyForce([(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5])
    }

    if (particlesOn) {
        emitters[0].pos[0] = mousePos.x
        emitters[0].pos[1] = mousePos.y

        if (mouseDown) {
            emitters[0].emit()
        }
        emitters[0].update()

        emitters[1].emit()
        emitters[1].update()

        for (let i = 0; i < emitters[0].particles.length; i++) {
            emitters[0].particles[i].applyForce([0, 0.2])
        }
        for (let i = 0; i < emitters[0].particles.length; i++) {
            if (!emitters[0].particles[i].initialForce) {
                emitters[0].particles[i].applyForce([(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5])
                emitters[0].particles[i].initialForce = true
            }
        }


        for (let i = 0; i < emitters[1].particles.length; i++) {
            emitters[1].particles[i].applyForce([Math.random() - 0.5, Math.random() - 0.5])
        }
    }
}

let emitters = []
function ParticleEmitter(x, y, number, lifeTime) {
    this.pos = [x, y]
    this.vel = [0, 0]
    this.acc = [0, 0]

    this.applyForce = function (force) {
        this.acc[0] += force[0]
        this.acc[1] += force[1]
    }

    this.particles = []
    this.emit = function () {
        for (let i = 0; i < number; i++) {
            this.particles.push(new Particle(this.pos[0], this.pos[1]))
        }
    }
    this.update = function () {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update()
            this.particles[i].show()

            if (this.particles[i].life > lifeTime) {
                this.particles.splice(i, 1)
            }
        }

        if (this.vel[0] + this.vel[1] > 5) {
            this.vel[0] -= 0.1
            this.vel[1] -= 0.1
        }

        this.vel[0] += this.acc[0]
        this.vel[1] += this.acc[1]

        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1]

        this.acc = [0, 0]

        if (this.pos[0] < 0) {
            this.pos[0] = innerWidth
        }
        if (this.pos[0] > innerWidth) {
            this.pos[0] = 0
        }
        if (this.pos[1] < 0) {
            this.pos[1] = innerHeight
        }
        if (this.pos[1] > innerHeight) {
            this.pos[1] = 0
        }
    }
}

function Particle(x, y) {
    this.pos = [x, y]
    this.vel = [0, 0]
    this.acc = [0, 0]

    this.applyForce = function (force) {
        this.acc[0] += force[0]
        this.acc[1] += force[1]
    }

    this.update = function () {
        this.vel[0] += this.acc[0]
        this.vel[1] += this.acc[1]

        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1]

        this.acc = [0, 0]

        this.life++

        if (this.pos[0] < 0) {
            this.vel[0] *= -0.5
        }
        if (this.pos[0] > innerWidth) {
            this.vel[0] *= -0.5
        }
        if (this.pos[1] < 0) {
            this.vel[1] *= -0.5
        }
        if (this.pos[1] > innerHeight) {
            this.vel[1] *= -0.5
        }
    }

    this.update = function () {
        this.vel[0] += this.acc[0]
        this.vel[1] += this.acc[1]

        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1]

        this.acc = [0, 0]

        this.life++

        if (this.pos[0] < 0) {
            this.vel[0] *= -0.5
        }
        if (this.pos[0] > innerWidth) {
            this.vel[0] *= -0.5
        }
        if (this.pos[1] < 0) {
            this.vel[1] *= -0.5
        }
        if (this.pos[1] > innerHeight) {
            this.vel[1] *= -0.5
        }
    }

    this.show = function () {
        let main = hexToRGBA(rs.getPropertyValue('--main'))
        ctx.strokeStyle = `rgba(${main.r}, ${main.g}, ${main.b}, ${main.a - this.life / 150})`
        ctx.lineWidth = 1
        circle(this.pos[0], this.pos[1], 10)
    }

    this.life = 0
}

function circle(x, y, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.stroke()
}


function toggleParticles() {
    if (particlesOn) {
        particlesOn = false
        setdown()
    } else {
        particlesOn = true
        setup()
    }
}

//scroll detection
let oldValue = 0
let newValue = 0
window.addEventListener('scroll', (e) => {
    newValue = window.pageYOffset
    if (oldValue < newValue) {
        particlesUp()
    } else if (oldValue > newValue) {
        particlesDown()
    }
    oldValue = newValue
})
function particlesUp() {
    for (let i = 0; i < emitters.length; i++) {
        for (let a = 0; a < emitters[i].particles.length; a++) {
            emitters[i].particles[a].applyForce([0, -0.5])
        }
    }
}
function particlesDown() {
    for (let i = 0; i < emitters.length; i++) {
        for (let a = 0; a < emitters[i].particles.length; a++) {
            emitters[i].particles[a].applyForce([0, 0.5])
        }
    }
}

//getting the mouse position
let mousePos = { x: undefined, y: undefined }
document.addEventListener('mousemove', logKey)
function logKey(e) {
    mousePos.x = e.clientX
    mousePos.y = e.clientY
}

//when the mouse is down
let mouseDown = false
document.addEventListener('mousedown', MouseDown)
function MouseDown(e) {
    mouseDown = true
}
document.addEventListener('mouseup', MouseUp)
function MouseUp(e) {
    mouseDown = false
}


// just the background
function bg() {
    for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i].id !== "backCanvas") {
            document.body.children[i].style.visibility = "hidden"
        }
    }
}