let gameState = []
let numberOfPlayers = 0
let playerView = 0
let rounds = 0
let drawLimit = 7
let turnIterations = 0
let allowDraw = true
let allowFactory = true
let allowEndTurn = false
let enteredCards = 0
let isOnline = null

//automatically decoding url if exists 
function startFromURL() {
    if (window.location.href.length > 32) {
        startup(alphabet.indexOf(urlParameters().charAt(urlParameters().length - 1)), true)
        decodeURLParameters()
        updateBoards()
        id("rounds").innerHTML = rounds
        id("turns").innerHTML = gameState[numberOfPlayers]
    }
}

//easier console.log
function log(log) {
    console.log(log)
}

//a random number function
function randomNumber(min, max) {
    return (Math.floor(Math.random() * (max + 1 - min))) + min
}

//easier document.getElementById
function id(id) {
    return document.getElementById(id)
}

//get the parameters of the url
function urlParameters() {
    var url = window.location.href
    let output = ""
    for (let i = 32; i < (window.location.href.length); i++) {
        output += url.charAt(i)
    }
    return output
}

var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

//encode the gamestate into a url parameter
function encodeGameState() {
    let output = ""
    //for each player
    for (let a = 0; a < numberOfPlayers; a++) {
        //for every card in the hand
        for (let b = 0; b < gameState[a][0].length; b++) {
            output += alphabet[gameState[a][0][b]]
        }
        output += "."

        //for every strength value
        for (let c = 0; c < gameState[a][1][0].length; c++) {
            output += alphabet[gameState[a][1][0][c]]
        }
        output += "."

        //for every resilience value
        for (let d = 0; d < gameState[a][1][1].length; d++) {
            output += alphabet[gameState[a][1][1][d]]
        }
        output += "."

        //for every special value
        for (let e = 0; e < gameState[a][1][2].length; e++) {
            output += alphabet[gameState[a][1][2][e]]
        }
        output += "."

        //for every attack/defense
        for (let f = 0; f < gameState[a][1][3].length; f++) {
            output += alphabet[gameState[a][1][3][f]]
        }
        output += "."

        //for every card health value
        for (let g = 0; g < gameState[a][1][4].length; g++) {
            output += alphabet[gameState[a][1][4][g]]
        }
        output += "."

        //for every player which owns the card which is being fought
        for (let h = 0; h < gameState[a][1][5][0].length; h++) {
            output += alphabet[gameState[a][1][5][0][h]]
        }
        output += "."

        //for every card number which is being fought
        for (let i = 0; i < gameState[a][1][5][1].length; i++) {
            output += alphabet[gameState[a][1][5][1][i]]
        }
        output += "."

        //for every cards tapped status
        for (let ia = 0; ia < gameState[a][1][6].length; ia++) {
            output += alphabet[gameState[a][1][6][ia]]
        }
        output += "."

        //for every card on board but not paired
        for (let j = 0; j < gameState[a][2].length; j++) {
            output += alphabet[gameState[a][2][j]]
        }
        output += "."

        //for every card in deck
        for (let k = 0; k < gameState[a][3].length; k++) {
            output += alphabet[gameState[a][3][k]]
        }
        output += "."

        //adding the players health
        if (gameState[a][4] > 9) {
            output += gameState[a][4]
        }
        else {
            output += ("0" + gameState[a][4])
        }

        output += "."

        //for every factory card
        for (let l = 0; l < gameState[a][5].length; l++) {
            output += alphabet[gameState[a][5][l]]
        }
        output += "."

        //number of jokers in play
        output += gameState[a][6]

        output += "."
    }
    if (gameState[numberOfPlayers] == (numberOfPlayers)) {
        output += "a." + alphabet[gameState[numberOfPlayers + 1] + 1]
    } else {
        console.log(gameState[numberOfPlayers])
        output += alphabet[gameState[numberOfPlayers]] + "." + alphabet[gameState[numberOfPlayers + 1]]
    }
    output += "." + alphabet[gameState[numberOfPlayers + 2]]
    output += "." + alphabet[gameState[numberOfPlayers + 3]]
    output += ":" + alphabet[numberOfPlayers]
    return output
}

//decode the url paramaters and turn them into the gameState
function decodeURLParameters() {
    let input = urlParameters()
    let currentInputCharNumber = 0
    numberOfPlayers = gameState[numberOfPlayers + 4] = (alphabet.indexOf(urlParameters().charAt(urlParameters().length - 1)))

    for (let a = 0; a < numberOfPlayers; a++) {
        //hand
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][0].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //strength
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][0].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //resilience
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][1].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //special
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][2].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //attacking or defending
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][3].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //hard health
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][4].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //player who owns card that is being fought
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][5][0].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //card number being fought
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][5][1].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //tapped statsuses
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][1][6].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //cards on board but not paired
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][2].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //deck
        gameState[a][3] = []
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][3].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        currentInputCharNumber++
        //player health
        gameState[a][4] = parseInt(String(input.charAt(currentInputCharNumber)) + (String(input.charAt(currentInputCharNumber + 1))))
        //factory cards
        currentInputCharNumber += 2
        do {
            if (input.charAt(currentInputCharNumber) !== ".") {
                gameState[a][5].push(alphabet.indexOf(input.charAt(currentInputCharNumber)))
            }
            currentInputCharNumber++
        } while (input.charAt(currentInputCharNumber) !== ".")
        //jokers
        gameState[a][6] = input.charAt(currentInputCharNumber)
        currentInputCharNumber++
    }
    playerView = gameState[numberOfPlayers] = alphabet.indexOf(input.charAt(input.length - 9))
    rounds = gameState[numberOfPlayers + 1] = alphabet.indexOf(input.charAt(input.length - 7))
    gameState[numberOfPlayers + 2] = alphabet.indexOf(input.charAt(input.length - 5))
    gameState[numberOfPlayers + 3] = alphabet.indexOf(input.charAt(input.length - 3))
}

//automatically copy the link
function copyLink() {
    var copyText = document.getElementById("copyTextInput")

    copyText.value = "https://wr-fool-card.glitch.me/#" + encodeGameState()

    copyText.select()
    copyText.setSelectionRange(0, 99999)

    document.execCommand("copy")

    showMessage("The link has been copied, send it to the next player")
}
//---------------------------------------------

function gameStateDisplay() {
    //    setInterval(function gameStateTrackerUpdate(){
    //    id("playerView").innerHTML = playerView + 1
    //    id("handDisplay").innerHTML = gameState[playerView][0]
    //    id("strengthDisplay").innerHTML = gameState[playerView][1][0]
    //    id("resilienceDisplay").innerHTML = gameState[playerView][1][1]
    //    id("specialDisplay").innerHTML = gameState[playerView][1][2]
    //    id("cardStatusDisplay").innerHTML = gameState[playerView][1][3]
    //    id("cardHealthDisplay").innerHTML = gameState[playerView][1][4]
    //    id("enteredDisplay").innerHTML = gameState[playerView][2]
    //    id("deckDisplay").innerHTML = gameState[playerView][3]
    //    id("healthDisplay").innerHTML = gameState[playerView][4]
    //    id("factoryDisplay").innerHTML = gameState[playerView][5]
    //  }, 100)
}
//--------------------------------------------

//sets players
function startup(players, online) {
    //whdfqiaufui WHY DOES IT PLAY OMINOUS MUSIC
    playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2Fbackground.mp3?v=1625447354743", 0.1)
    numberOfPlayers = players
    isOnline = online
    for (let i = 0; i < numberOfPlayers; i++) {
        gameState[i] = new Array(
            new Array(0),
            new Array(
                new Array(0), new Array(0), new Array(0), new Array(0), new Array(0), new Array(new Array(0), new Array(0)), new Array(0)
            ),
            new Array(0),
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            new Array(0),
            new Array(0),
            new Array(0)
        )
        gameState[i][4] = 30
    }
    gameState[numberOfPlayers] = new Array(0)
    gameState[numberOfPlayers + 1] = 0
    gameState[numberOfPlayers + 2] = 0
    gameState[numberOfPlayers + 3] = 0
    gameState[numberOfPlayers + 4] = numberOfPlayers
    gameState[numberOfPlayers] = 0

    id("buttons").style.display = "none"
    id("roundDisplay").style.display = "block"
    id("textBox").style.display = "block"
    createElement("P", "textBox", "Game Text Goes Here:")

    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "boardDisplay", null, "playerBoard" + i)
    }

    playerView = gameState[numberOfPlayers]
    id("playerView").innerHTML = playerView + 1
    allowEndTurn = true
    showMessage("Press 'E' to end turn")
    showMessage("Press 'A' to show next player's assets")
    gameStateDisplay()
    updateBoards()
}

//damaging an asset
function damageAsset(player, cardNumber, damage) {
    if ((cardNumber + 1) <= gameState[player][1][4].length) {
        gameState[player][1][4][cardNumber] -= damage
    }
}

//dealing damage to a player
function damagePlayer(player, amount) {
    gameState[player][4] -= amount
}

//removing dead assets per player
function removeDeadAssets(player) {
    for (let i = 0; i <= gameState[player][1][4].length; i++) {
        if (gameState[player][1][4][i] < 1) {
            gameState[player][1][0].splice(i, 1)
            gameState[player][1][1].splice(i, 1)
            gameState[player][1][2].splice(i, 1)
            gameState[player][1][3].splice(i, 1)
            gameState[player][1][4].splice(i, 1)
        }
    }
}


let randomCard = null

//drawing a card
function drawCard(player, numberOfCards) {
    if (allowDraw) {

        let soundIterations = 0
        var drawSound = setInterval(function () {
            if (soundIterations < numberOfCards) {
                playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2FdrawCard.mp3?v=1625491712122", 1)
            } else {
                clearInterval(drawSound)
            }
            soundIterations++
        }, 50)

        setDrawLimit()
        for (let i = 0; i < numberOfCards; i++) {
            if (gameState[player][3].length !== 0) {
                randomCard = randomNumber(1, gameState[player][3].length)
                let cardDrawn = gameState[player][3][randomCard - 1]

                gameState[player][3].splice(randomCard - 1, 1)
                gameState[player][0].push(cardDrawn)

                updateBoards()

            } else {
                showMessage("Out of cards you dummy -_-")
            }
        } allowDraw = false
    } else {
        showMessage("YOU JUST DREW CALM DOWN!")
    }
}

let nextPlayer = playerView + 1

function addNextPlayer() {
    nextPlayer++
    if (nextPlayer == numberOfPlayers) {
        nextPlayer = 0
    }
    if (nextPlayer == playerView) {
        nextPlayer++
    }
    if (nextPlayer == numberOfPlayers) {
        nextPlayer = 0
    }
}

//determining round number based on if all players have ended their turn
function endTurn() {
    gameState[numberOfPlayers]++
    id("turns").innerHTML = gameState[numberOfPlayers]
    if (gameState[numberOfPlayers] === numberOfPlayers && !isOnline) {
        rounds++
        gameState[numberOfPlayers + 1] = rounds
        gameState[numberOfPlayers] = 0
        id("turns").innerHTML = gameState[numberOfPlayers]
        id("rounds").innerHTML = rounds
    }
    if (!isOnline) {

        allowDraw = true
        enteredCards = 0

        if (playerView == numberOfPlayers - 1) {
            playerView = 0
            nextPlayer = playerView + 1
            if (gameState[playerView][5].length == 5) {
                allowFactory = false
            } else {
                allowFactory = true
            }
        } else {
            playerView++
            nextPlayer = playerView + 1
            if (nextPlayer == numberOfPlayers) {
                nextPlayer = 0
            }
            if (gameState[playerView][5].length == 5) {
                allowFactory = false
            } else {
                allowFactory = true
            }
        }
        if (rounds == 0) {
            showMessage("Press 'E' to end turn")
            showMessage("Press 'A' to show next player's assets")
        }
        assetValues = []
        setStrength = true
        setResilience = false
        setSpecial = false
        gameState[playerView][1][6] = []
        updateBoards()
    } else {
        copyLink()
    }
}

//setting a limit to the amount of cards you can draw depending on round number
function setDrawLimit() {
    if (rounds == 0) {
        return 7
    } else if (rounds == 1) {
        return 1
    } else if (rounds == 2) {
        return 2
    } else if (rounds == 3) {
        return 3
    } else if (rounds == 4) {
        return 4
    } else if (rounds >= 5) {
        return 5
    }
}

//putting a card on the board
function enterCard(player, cardNumber) {
    if (enteredCards !== gameState[playerView][5].length) {
        let cardValue = gameState[player][0][cardNumber]
        gameState[player][0].splice(cardNumber, 1)
        gameState[player][2].push(cardValue)
        enteredCards++
        updateBoards()

        playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2FenterCard.mp3?v=1625492182300", 1)
    } else {
        showMessage("wow you really tried to enter more cards than you knew you could, not cool...")
    }
}

//putting two cards on the board as a strength/resistence pair with specials attached
function createAsset(strength, resilience, special) {
    playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2Fcreate%20Assert.mp3?v=1625590426650", 1)
    let Strength = 0
    let Resilience = 0
    let Special = 0
    if (assetValues[0] < 11) {
        Strength = assetValues[0]
    }
    if (assetValues[1] < 11) {
        Resilience = assetValues[1]
    }
    if (assetValues[2] == 11) {
        Special = assetValues[2]
    }
    if (assetValues[2] == 13) {
        Special = assetValues[2]
    }

    gameState[playerView][1][0].push(Strength)
    assetValues.splice(0, 1)
    gameState[playerView][2].splice(strength, 1)

    gameState[playerView][1][1].push(Resilience)
    gameState[playerView][1][4].push(Resilience)
    assetValues.splice(0, 1)
    if (strength < resilience) {
        gameState[playerView][2].splice(resilience - 1, 1)
    } else {
        gameState[playerView][2].splice(resilience, 1)
    }

    if (special !== null) {
        gameState[playerView][1][2].push(Special)
        assetValues.splice(0, 1)
        if (strength < special && resilience > special) {
            gameState[playerView][2].splice(special - 1, 1)
        } else if (strength < special && resilience < special) {
            gameState[playerView][2].splice(special - 2, 1)
        } else if (strength > special && resilience > special) {
            gameState[playerView][2].splice(special, 1)
        }
    } else {
        gameState[playerView][1][2].push(0)
    }

    gameState[playerView][1][3].push(0)
    gameState[playerView][1][6].push(0)
    updateBoards()
}

//creating a factory
function createFactory(player, cardNumber) {
    if (allowFactory) {
        if (gameState[player][0][cardNumber] < 11) {
            gameState[player][5].push(gameState[player][0][cardNumber])
            gameState[player][0].splice(cardNumber, 1)
            allowFactory = false
            updateBoards()

            playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2FcreateFactory.mp3?v=1625492086309", 1)
        } else if (gameState[player][0][cardNumber] == 11) {
            showMessage("Yeah nice one, you really tried making a Jack into a factory...")
        } else if (gameState[player][0][cardNumber] == 12) {
            showMessage("DUDE, queens cannot be made into factories!")
        } else if (gameState[player][0][cardNumber] == 13) {
            showMessage("YOU MORON, PUT A NUMBERED CARD NOT A KING!")
        } else if (gameState[player][0][cardNumber] == 14) {
            showMessage("A Joker as a factory? You idiot.")
        }
    } else {
        var x = randomNumber(0, 5)
        if (x < 5) {
            showMessage("Bruh, you literally cannot create more factories this turn")
        } else if (x == 5) {
            showMessage("OwO, no more factory making this turn :flushed:")
        }
    }
}

//killing a card
function killCard(player, cardNumber) {
    gameState[player][1][0].splice(cardNumber, 1)
    gameState[player][1][1].splice(cardNumber, 1)
    gameState[player][1][2].splice(cardNumber, 1)
    gameState[player][1][3].splice(cardNumber, 1)
    gameState[player][1][4].splice(cardNumber, 1)
    //gameState[1][5]? (laaaater)
    gameState[player][1][6].splice(cardNumber, 1)
}

//tapping a card
function tapCard(player, cardNumber, untap) {
    if (gameState[player][1][2][cardNumber] !== 13) {
        gameState[player][1][6][cardNumber] = 1
    }
    if (untap == true) {
        gameState[player][1][6][cardNumber] = 0
    }
    updateBoards()
}

//using a queen
function useQueen(player, cardNumber) {

    if (gameState[player][2][cardNumber] = 12) {
        gameState[player][2].splice(cardNumber, 1)
        damagePlayer(player, -5)
        updateBoards()
    }
}

//run on page load
startFromURL()

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

//play a sound
function playSound(src, volume) {
    var sound = new Audio(src)
    sound.volume = volume
    sound.play()
}

//creating all the elements for the board
function updateBoards() {
    //clears board
    for (let i = 0; i < numberOfPlayers; i++) {
        id("playerBoard" + i).innerHTML = ""
        id("playerBoard" + i).style.display = "none"
    }
    id("playerBoard" + playerView).style.display = "block"

    //enemy health
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, "Player " + (nextPlayer + 1) + "'s health: " + gameState[nextPlayer][4], "enemyHealth" + i)
    }
    // enemy factories
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "enemyFactories" + i, "factories-container")
        if (gameState[nextPlayer][5].length > 0) {
            createElement("P", "enemyFactories" + i, "Player " + (nextPlayer + 1) + "'s factories: ")
        } else {
            createElement("P", "enemyFactories" + i, "Player " + (nextPlayer + 1) + " has no factories")
        }
        for (let e = 0; e < gameState[nextPlayer][5].length; e++) {
            var card = gameState[nextPlayer][5][e]
            if (card == 1) {
                card = "Ace"
            }
            createElement("DIV", "enemyFactories" + i, card, "enemyFactoryCards" + i, "card")
        }
    }
    //enemy assets
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "enemyAssets" + i, "asset-cards-container")
        if (gameState[nextPlayer][1][0].length == 0) {
            createElement("P", "enemyAssets" + i, "Player " + (nextPlayer + 1) + " has no assets", "enemyAssetText")
        } else {
            createElement("P", "enemyAssets" + i, "Player " + (nextPlayer + 1) + "'s assets:", "enemyAssetText")
        }
        for (let e = 0; e < gameState[nextPlayer][1][0].length; e++) {

            var special = gameState[nextPlayer][1][2][e]
            if (special == 11) {
                special = "Jack"
            } else if (special == 13) {
                special = "King"
            }
            createElement("DIV", "enemyAssets" + i, null, i + "enemy-asset-container" + e, "enemy-asset")
            createElement("P", i + "enemy-asset-container" + e, gameState[nextPlayer][1][0][e], i + "enemy-asset-strength" + e, "asset-text")
            createElement("P", i + "enemy-asset-container" + e, special, i + "enemy-asset-special" + e, "asset-text")
            createElement("P", i + "enemy-asset-container" + e, gameState[nextPlayer][1][4][e], i + "enemy-asset-resilience" + e, "asset-text")

            if (gameState[nextPlayer][1][6][e] == 1) {
                id(i + "enemy-asset-container" + e).classList.add("tapped")
            }
        }
    }

    //assets
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "assetCards" + i, "asset-cards-container")
        for (let e = 0; e < gameState[i][1][0].length; e++) {
            gameState[i][1][3][e] = 0
            var special = gameState[i][1][2][e]
            if (special == 11) {
                special = "Jack"
            } else if (special == 13) {
                special = "King"
            }
            var strength = gameState[i][1][0][e]
            var resilience = gameState[i][1][4][e]
            createElement("DIV", "assetCards" + i, null, i + "asset-container" + e, "asset", null, function r() {
                gameState[i][1][3][e] = 1
                id(i + "asset-container" + e).classList.add("highlight")
                console.log(strength, special, resilience)
            })
            createElement("P", i + "asset-container" + e, strength, i + "asset-strength" + e, "asset-text")
            createElement("P", i + "asset-container" + e, special, i + "asset-special" + e, "asset-text")
            createElement("P", i + "asset-container" + e, resilience, i + "asset-resilience" + e, "asset-text")
            if (gameState[playerView][1][6][e] == 1) {
                id(i + "asset-container" + e).classList.add("tapped")
            }
        } createElement("SPAN", "assetCards" + i, "+", "addAsset", "card", null, function e() {
            updateBoards()
            storeAsset(1)
            assetValues = []
            setStrength = true
            setResilience = false
            setSpecial = false
        })
    }
    //entered cards
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "entered" + i, "entered-cards-container")
        for (let e = 0; e < gameState[i][2].length; e++) {
            var card = gameState[i][2][e]
            if (card == 11) {
                card = "Jack"
            } else if (card == 12) {
                card = "Queen"
            } else if (card == 13) {
                card = "King"
            } else if (card == 14) {
                card = "Joker"
            } else if (card == 1) {
                card = "Ace"
            }
            createElement("DIV", "entered" + i, card, i + "enteredCards" + e, "card")
            id(i + "enteredCards" + e).addEventListener("click", function () {
                if (assetValues.length < 3) {
                    storeAsset(0, e, gameState[playerView][2][e])
                    playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2Fselect%20card.mp3?v=1625590193454", 1)
                }
                if (id(i + "enteredCards" + e).innerHTML == "Queen") {
                    useQueen(i, e)
                }
            })
        }
        createElement("SPAN", "entered" + i, "+", "addEntered", "card", null, function e() {
            assetValues = []
            setStrength = true
            setResilience = false
            setSpecial = false
            enterCard(playerView, handSelected)
            updateBoards()
        })
    }
    //factories
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "factories" + i, "factories-container")
        for (let e = 0; e < gameState[i][5].length; e++) {
            var card = gameState[i][5][e]
            if (card == 1) {
                card = "Ace"
            }
            createElement("DIV", "factories" + i, card, "factoryCards" + i, "card")
        }
        createElement("SPAN", "factories" + i, "+", "addFactory", "card", null, function e() {
            assetValues = []
            setStrength = true
            setResilience = false
            setSpecial = false
            createFactory(playerView, handSelected)
            updateBoards()
        })
    }
    //hands
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "hand" + i, "hand-container")
        for (let e = 0; e < gameState[i][0].length; e++) {
            var card = gameState[i][0][e]
            if (card == 11) {
                card = "Jack"
            } else if (card == 12) {
                card = "Queen"
            } else if (card == 13) {
                card = "King"
            } else if (card == 14) {
                card = "Joker"
            } else if (card == 1) {
                card = "Ace"
            }
            createElement("DIV", "hand" + i, card, i + "handCard" + e, "card")
            id(i + "handCard" + e).addEventListener("click", function () {
                handSelected = e
                updateBoards()
                assetValues = []
                setStrength = true
                setResilience = false
                setSpecial = false
                playSound("https://cdn.glitch.com/24b4db7a-6aea-4463-bf45-444cd9bb1d46%2Fselect%20card.mp3?v=1625590193454", 1)
                id(i + "handCard" + e).classList.add("highlight")
            })
        }
    }
    //decks
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, null, "deck" + i, "deck-container")
    }
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "deck" + i, gameState[i][3].length, "deckCards" + i, "card")
        id("deckCards" + i).addEventListener("click", function () {
            drawCard(playerView, setDrawLimit())
        })
    }
    //player healths
    for (let i = 0; i < numberOfPlayers; i++) {
        createElement("DIV", "playerBoard" + i, "Player " + (playerView + 1) + ", your health: " + gameState[i][4], "health" + i)
    }
}

//choose what to do with card in hand
let handSelected

//resets stuff when you press space
document.onkeypress = logKey
let gameStateShow = false
function logKey(e) {
    if (e.code == "Space") {
        updateBoards()
        assetValues = []
        setStrength = true
        setResilience = false
        setSpecial = false
        handSelected = null
    } else if (e.code == "KeyA") {
        addNextPlayer()
        updateBoards()
    } else if (e.code == "KeyE") {
        if (allowEndTurn) {
            endTurn()
        }
    }
}

let setStrength = true
let setResilience = false
let setSpecial = false
let assetValues = []

let strengthInput = null
let resilienceInput = null
let specialInput = null

function storeAsset(yes, e, cardValue) {
    if (gameState[playerView][2].length >= 2) {

        if (yes == 0) {
            if (setStrength) {
                if (cardValue < 11) {
                    assetValues.push(cardValue)
                    strengthInput = e
                    document.getElementById(playerView + "enteredCards" + e).classList.add("highlight")
                    setStrength = false
                    setResilience = true
                } else if (cardValue == 11 || cardValue == 13 || cardValue == 14) {
                    showMessage("Come on, you're better than this, you know Jacks, Kings, Queens and Jokers can't be used as strength")
                }
            } else if (setResilience) {
                if (cardValue < 11) {
                    assetValues.push(cardValue)
                    resilienceInput = e
                    document.getElementById(playerView + "enteredCards" + e).classList.add("highlight")
                    setResilience = false
                    setSpecial = true
                } else {
                    showMessage("Dude really.. just put a numbered card")
                }
            } else if (setSpecial) {
                if (cardValue == 11 || cardValue == 13) {
                    assetValues.push(cardValue)
                    specialInput = e
                    document.getElementById(playerView + "enteredCards" + e).classList.add("highlight")
                    setSpecial = false
                    setStrength = true
                } else {
                    showMessage("ADD A KING OR A JACK IT'S NOT THAT HARD TO UNDERSTAND")
                }
            }
        } else if (yes == 1) {
            if (assetValues.length >= 2) {
                if (setSpecial == true) {
                    createAsset(strengthInput, resilienceInput)
                } else {
                    createAsset(strengthInput, resilienceInput, specialInput)
                }
            }
        }
    } else if (cardValue !== 14) {
        showMessage("You don't have enough cards to make an asset")
    }
}

function showMessage(message) {
    createElement("P", "textBox", "Game Says to Player " + (playerView + 1) + ": " + message)
    id("textBox").scrollTop = (id("textBox").scrollHeight)
}

var root = document.querySelector(':root')

function setColor() {
    let RGB = [0, 0, 0]
    const random = randomNumber(1, 3)
    RGB[random - 1] = 255
    RGB[(random + 1) % 3] = randomNumber(0, 255)
    root.style.setProperty('--color', "linear-gradient(45deg," + "rgb(" + RGB[0] + "," + RGB[1] + "," + RGB[2] + ")" + "," + "rgb(" + RGB[1] + "," + RGB[2] + "," + RGB[0] + ")" + ")")
    root.style.setProperty('--color1', "rgb(" + RGB[0] + "," + RGB[1] + "," + RGB[2] + ")")
    root.style.setProperty('--color2', "rgb(" + RGB[1] + "," + RGB[2] + "," + RGB[0] + ")")
}

setColor()