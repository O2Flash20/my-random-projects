
function randomColourTest() {
    setInterval(function e() { document.body.style.background = "rgba(" + randomNumber(0, 255) + "," + randomNumber(0, 255) + "," + randomNumber(0, 255) + ",255)" }, 70)
}

//declaring player stats
let startHealthP1 = null
let healthP1 = null
let attackMinP1 = null
let attackMaxP1 = null
let defenseMinP1 = null
let defenseMaxP1 = null
let specialP1 = null

let startHealthP2 = null
let healthP2 = null
let attackMinP2 = null
let attackMaxP2 = null
let defenseMinP2 = null
let defenseMaxP2 = null
let specialP2 = null

//declaring game vairables
let rounds = 0
let p1Damage = null
let p2Damage = null
let p1Defense = null
let p2Defense = null
let moveHealthP1 = null
let moveHealthP2 = null

//a random number function
function randomNumber(min, max) {
    return (Math.floor(Math.random() * (max + 1 - min))) + min
}

function start() {
    document.getElementById("player1Stats").style.display = "inline-block" //show player 1 stats

    document.getElementById("player2Stats").style.display = "inline-block" //show player 2 stats

    document.getElementById("button1").onclick = setHealth //make it run setHealth on click

    document.getElementById("button1").innerHTML = "Set health" //change what the button says
}


//Setting players' stats

function setHealth() {
    healthP1 = randomNumber(175, 200)
    startHealthP1 = healthP1
    healthP2 = randomNumber(175, 200)
    startHealthP2 = healthP2
    document.getElementById("healthP1").innerHTML = healthP1
    document.getElementById("healthP2").innerHTML = healthP2
    document.getElementById("button1").innerHTML = "Set Attack"
    document.getElementById("healthDisplayP1").innerHTML = healthP1
    document.getElementById("healthDisplayP2").innerHTML = healthP2
    document.getElementById("button1").onclick = setAttack
}

function setAttack() {
    attackMinP1 = randomNumber(5, 10)
    attackMaxP1 = randomNumber(11, 20)
    attackMinP2 = randomNumber(5, 10)
    attackMaxP2 = randomNumber(11, 20)

    document.getElementById("attackP1").innerHTML = (String(attackMinP1) + "-" + String(attackMaxP1))
    document.getElementById("attackP2").innerHTML = (String(attackMinP2) + "-" + String(attackMaxP2))

    document.getElementById("button1").innerHTML = "Set Defense"
    document.getElementById("button1").onclick = setDefense
}

function setDefense() {
    defenseMinP1 = randomNumber(5, 10)
    defenseMaxP1 = randomNumber(11, 20)
    defenseMinP2 = randomNumber(5, 10)
    defenseMaxP2 = randomNumber(11, 20)

    document.getElementById("defenseP1").innerHTML = (String(defenseMinP1) + "-" + (defenseMaxP1) + "%")
    document.getElementById("defenseP2").innerHTML = (String(defenseMinP2) + "-" + (defenseMaxP2) + "%")
    document.getElementById("button1").innerHTML = "Set Special"
    document.getElementById("button1").onclick = setSpecial
}

function setSpecial() {
    specialP1 = randomNumber(20, 30)
    specialP2 = randomNumber(20, 30)

    document.getElementById("specialP1").innerHTML = specialP1
    document.getElementById("specialP2").innerHTML = specialP2

    document.getElementById("button1").innerHTML = "Set Costumes"
    document.getElementById("button1").onclick = function openCostumes() {
        document.getElementById("characterSelectP1").style.visibility = "visible"
        document.getElementById("characterSelectP2").style.visibility = "visible"
        document.getElementById("button1").style.visibility = "hidden"
    }
}
//-----------------------

//setting players' costume
let hueRotateCount = 0
const easterEgg = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
let playersHaveCostume = [false, false]
function setCostume(player, costume) {
    document.getElementById("man" + player).style.filter = "brightness(100%)"
    //amogus
    if (costume == "amogus") {
        var amogusSound = new Audio("https://cdn.glitch.com/f4c71718-9108-45ed-ac15-096b13468b3a%2FAMOGUS%20Sound%20effect.mp3?v=1623092010222")
        amogusSound.play()
        document.getElementById("man" + player).src = ("https://cdn.glitch.com/f4c71718-9108-45ed-ac15-096b13468b3a%2Famogus.png?v=1622930219158")
        setTimeout(
            function l() {
                document.getElementById('man' + player).style.filter = document.getElementById('man' + player).style.filter + "saturate(25)"
                document.getElementById('man' + player).style.filter = document.getElementById('man' + player).style.filter + "contrast(100)"
                var amogusInterval = setInterval(
                    function e() {
                        if (hueRotateCount < 50) {
                            hueRotateCount++
                            document.getElementById('man' + player).style.filter += "hue-rotate(" + randomNumber(0, 360) + "deg)"
                        } else {
                            clearInterval(amogusInterval)
                            document.getElementById('man' + player).style.filter = "brightness(100%)"
                        }
                    }
                    , 100)
            }
            , 3000)
        //run he's behind you
    } else if (costume == "Run Hes Behind You") {
        var runSound = new Audio("https://cdn.glitch.com/f4c71718-9108-45ed-ac15-096b13468b3a%2F!Wake%20up.%20Wake%20up.%20Run.%20RUN!!!.mp3?v=1623092666403")
        runSound.play()
        setTimeout(function e() {
            document.getElementById('man' + player).style.transform = 'scale(10)'
            document.getElementById('man' + player).style.top = "-600px"
        },
            9000)
        setTimeout(function e() {
            document.getElementById('man' + player).style.transform = 'scale(1)'
            document.getElementById('man' + player).style.top = "0px"
        },
            10000)
        document.getElementById("man" + player).src = ("https://cdn.glitch.com/f4c71718-9108-45ed-ac15-096b13468b3a%2FDrawing-1.sketchpad.png?v=1622987592894")
        document.getElementById("man" + player).style.width = "250px"
        //rgb
    } else if (costume == "RGB") {
        let hue = 0
        setInterval(
            function RGBMan() {
                hue += 8
                document.getElementById("man" + player).style.filter = "hue-rotate(" + hue + "deg) brightness(200%)"
            }
            , 100)
        //custom
    } else if (costume == 'custom') {
        document.getElementById("customPlayerTitle").innerHTML = "Player " + player + " Custom Colour"
        var UILoop = setInterval(
            function customCharacterUpdate() {
                if (requestCloseUI == false) {
                    document.getElementById("man" + player).style.filter = "hue-rotate(" + document.getElementById("hueSlider").value + "deg) brightness(" + document.getElementById("brightnessSlider").value + "%)"
                } else {
                    document.getElementById("customPlayerSelect").style.visibility = "hidden"
                    document.getElementById("characterSelectP" + player).style.visibility = "hidden"
                    document.getElementById("hueSlider").value = 0
                    document.getElementById("brightnessSlider").value = 200
                    requestCloseUI = false
                    clearInterval(UILoop)
                }
            }
            , 100)
        document.getElementById("customPlayerSelect").style.visibility = "visible"
    }
    document.getElementById("characterSelectP" + player).style.visibility = "hidden"
    playersHaveCostume[player - 1] = true
}
let requestCloseUI = false
function closeCustomUI() {
    requestCloseUI = true
}

//button reappears after costume select
var reappearButtone = setInterval(function reappearButton() {
    if (playersHaveCostume[0] == true && playersHaveCostume[1] == true) {
        clearInterval(reappearButtone)
        document.getElementById("button1").style.visibility = "visible"
        document.getElementById("button1").innerHTML = "Play Game"
        document.getElementById("button1").onclick = startGame
    }
}, 500)

//starts the game
function startGame() {
    document.getElementById("roundNumber").innerHTML = (String("Round ") + (rounds))
    document.getElementById("button1").innerHTML = "play round"
    document.getElementById("button1").onclick = round
}

//calculations every round
function round() {
    rounds = rounds + 1
    if (rounds === 3) {
        p1Damage = randomNumber(attackMinP1, attackMaxP1) + specialP1
        p2Damage = randomNumber(attackMinP2, attackMaxP2) + specialP2
    } else if (rounds === 6) {
        p1Damage = randomNumber(attackMinP1, attackMaxP1) + specialP1
        p2Damage = randomNumber(attackMinP2, attackMaxP2) + specialP2
    } else if (rounds === 9) {
        p1Damage = randomNumber(attackMinP1, attackMaxP1) + specialP1
        p2Damage = randomNumber(attackMinP2, attackMaxP2) + specialP2
    } else if (rounds === 12) {
        p1Damage = randomNumber(attackMinP1, attackMaxP1) + specialP1
        p2Damage = randomNumber(attackMinP2, attackMaxP2) + specialP2
    } else {
        p1Damage = randomNumber(attackMinP1, attackMaxP1)
        p2Damage = randomNumber(attackMinP2, attackMaxP2)
    }
    p1Defense = randomNumber(defenseMinP1, defenseMaxP1)
    p2Defense = randomNumber(defenseMinP2, defenseMaxP2)
    healthP1 = Math.round(100 * (healthP1 - (p2Damage - (p2Damage / p1Defense)))) / 100
    healthP2 = Math.round(100 * (healthP2 - (p1Damage - (p1Damage / p2Defense)))) / 100

    moveHealthP1 = 300 - (healthP1 * 300) / startHealthP1 + "px"
    moveHealthP2 = 300 - (healthP2 * 300) / startHealthP2 + "px"

    document.getElementById("healthbarDisplay1").style.right = moveHealthP1
    document.getElementById("healthbarDisplay2").style.right = moveHealthP2

    document.getElementById("healthDisplayP1").style.left = moveHealthP1
    document.getElementById("healthDisplayP2").style.left = moveHealthP2

    document.getElementById("damageDisplayP1").innerHTML = (String("Player 1 dmg: ") + p1Damage)
    document.getElementById("damageDisplayP2").innerHTML = (String("Player 2 dmg: ") + p2Damage)
    document.getElementById("defenseDisplayP1").innerHTML = (String("Player 1 defense: ") + p1Defense + "%")
    document.getElementById("defenseDisplayP2").innerHTML = (String("Player 2 defense: ") + p2Defense + "%")

    if (healthP1 <= 0 && healthP2 <= 0) {
        if (healthP1 > healthP2) {
            document.getElementById("gameOutcome").innerHTML = "Player 1 wins"
            document.getElementById("button1").style.display = "none"
        } else if (healthP2 > healthP1) {
            document.getElementById("gameOutcome").innerHTML = "Player 2 wins"
            document.getElementById("button1").style.display = "none"
        } else if (healthP1 === healthP2) {
            document.getElementById("gameOutcome").innerHTML = "tie"
            document.getElementById("button1").style.display = "none"
        }
    } else if (healthP2 <= 0) {
        document.getElementById("gameOutcome").innerHTML = "Player 1 wins"
        document.getElementById("button1").style.display = "none"
    } else if (healthP1 <= 0) {
        document.getElementById("gameOutcome").innerHTML = "Player 2 wins"
        document.getElementById("button1").style.display = "none"
    }

    document.getElementById("roundNumber").innerHTML = (String("Round ") + (rounds))
    document.getElementById("healthDisplayP1").innerHTML = healthP1
    document.getElementById("healthDisplayP2").innerHTML = healthP2
}
function resetStats() {
    document.getElementById("healthP1").innerHTML = null
    document.getElementById("attackP1").innerHTML = null
    document.getElementById("defenseP1").innerHTML = null
    document.getElementById("specialP1").innerHTML = null
    document.getElementById("healthP2").innerHTML = null
    document.getElementById("attackP2").innerHTML = null
    document.getElementById("defenseP2").innerHTML = null
    document.getElementById("specialP2").innerHTML = null
    document.getElementById("button1").innerHTML = "start"
    document.getElementById("button1").onclick = start()
}

//Minigames---------------------------------------
//a key press detector
function onKeyPressed(key, result) {
    var keysScript = document.createElement("SCRIPT")
    keysScript.innerHTML = "document.addEventListener('keydown', checkKey);function checkKey(keyPressed){if (keyPressed.key == " + "'" + (key) + "'" + "){" + result + "}}"
    document.getElementById("scriptsHolder").appendChild(keysScript)
}

//cps minigame
let clicks = 0
function registerClick() {
    clicks++
}
function cpsTest() {
    let secondsSinceEpochStart = Math.round(Date.now() / 1000)
    setInterval(
        function resetClickDisplay() {
            var secondsSinceEpochNow = Math.round(Date.now() / 1000)
            var cpsTime = (secondsSinceEpochNow - secondsSinceEpochStart)
            document.getElementById("cpsDisplay").innerHTML = String(Math.round(clicks / cpsTime) + " cps")
        }
        , 100)
}

//combo mingame
let enemyIsOnCrosshair = true
let hit = false
let lose = false

let totalHits = 0
function hitEnemy() {
    if (!hit && enemyIsOnCrosshair && !lose) {
        if (1.5 < enemyScale) {
            enemyScale /= 1.5
            document.getElementById('comboEnemy').style.transform = 'scale(' + enemyScale + ')'
            document.getElementById('comboEnemy').style.background = 'red'
            document.getElementById('comboEnemy').style.opacity = "75%"
            //document.getElementById('comboEnemy').style.top = "-80px";
            hit = true
            setTimeout(function e() {
                document.getElementById('comboEnemy').style.background = 'blue'; document.getElementById('comboEnemy').style.opacity = "100%"; hit = false //document.getElementById('comboEnemy').style.top = "-30px";
            }, 100)
            totalHits++
            var hitSound = new Audio("https://cdn.glitch.com/f4c71718-9108-45ed-ac15-096b13468b3a%2FMinecraft%20Hit%20-%20Sound%20Effect%20(HD).mp3?v=1623342767092")
            hitSound.currentTime = 0.73
            hitSound.play()
        }
    }
}

let enemyScale = 1
function startComboGame() {
    onKeyPressed('a', "document.getElementById('comboEnemy').style.right = -10 + parseFloat(document.getElementById('comboEnemy').style.right) + 'px'")
    onKeyPressed('d', "document.getElementById('comboEnemy').style.right = 10 + parseFloat(document.getElementById('comboEnemy').style.right) + 'px'")
    onKeyPressed('w', "enemyScale *= 1.2;document.getElementById('comboEnemy').style.transform = 'scale(' + enemyScale + ')'")
    onKeyPressed('s', "if(enemyScale > 0.5){enemyScale /= 1.2;document.getElementById('comboEnemy').style.transform = 'scale(' + enemyScale + ')'}")
    onKeyPressed("k", "hitEnemy()")

    setInterval(
        function e() {
            let repeats = 0
            var randomMove = randomNumber(1, 2)

            if (randomMove == 1) {
                var moveLeft = setInterval(function functione() {
                    if (repeats < 500) {
                        repeats++
                        document.getElementById('comboEnemy').style.right = 0.22 + parseFloat(document.getElementById('comboEnemy').style.right) + 'px'
                    } else {
                        clearInterval(moveLeft)
                    }
                }, 1)
            }

            if (randomMove == 2) {
                var moveRight = setInterval(function e() {
                    if (repeats < 500) {
                        repeats++
                        document.getElementById('comboEnemy').style.right = -0.2 + parseFloat(document.getElementById('comboEnemy').style.right) + 'px'
                    } else {
                        clearInterval(moveRight)
                    }
                }, 1)
            }
        }
        , 1000)

    setInterval(function scaleEnemy() {
        enemyScale *= 1.005
        document.getElementById('comboEnemy').style.transform = 'scale(' + enemyScale + ')'
    }, 1)

    var checkLoseInterval = setInterval(function enemyHit() {
        if (enemyScale > 6) {
            var loseSound = new Audio("https://cdn.glitch.com/f4c71718-9108-45ed-ac15-096b13468b3a%2FMinecraft%20Cave%20Ambience%20-%20Sound%20Effect%20(HD).mp3?v=1623366151261")
            loseSound.play()
            document.getElementById("LOSE").style.visibility = "visible"
            document.getElementById("comboCanvas").style.background = "#FF786F"
            lose = true
        }
        if (lose) {
            clearInterval(checkLoseInterval)
        }
    }, 100)

    setInterval(function checkEnemyOnCrosshair() {
        var left = parseFloat(document.getElementById('comboEnemy').style.right)
        var right = left + parseFloat(parseFloat(document.getElementById('comboEnemy').style.right))
        if (left > (-50 + -25 * enemyScale) && right < (-25 + 25 * enemyScale)) {
            enemyIsOnCrosshair = true
        } else {
            enemyIsOnCrosshair = false
        }
    }, 100)

    setInterval(function scoreDisplay() {
        document.getElementById("scoreDisplay").innerHTML = totalHits
    }, 10)
}
