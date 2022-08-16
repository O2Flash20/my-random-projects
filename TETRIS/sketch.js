let ground = [...Array(20)].map(e => Array(10).fill(0))
let air = [...Array(20)].map(e => Array(10).fill(0))

let colors

let pieces = [
    // 0
    [
        [1, 1],
        [1, 1]
    ],
    // I
    [
        [2, 2, 2, 2],
    ],
    // S
    [
        [0, 3, 3],
        [3, 3, 0]
    ],
    // Z
    [
        [4, 4, 0],
        [0, 4, 4]
    ],
    // L
    [
        [0, 0, 5],
        [5, 5, 5]
    ],
    // J
    [
        [6, 0, 0],
        [6, 6, 6]
    ],
    // T
    [
        [0, 7, 0],
        [7, 7, 7]
    ],
    // // AMOGUS
    // [
    //     [0, 8, 8, 8, 0],
    //     [8, 8, 8, 8, 8],
    //     [8, 8, 8, 8, 8],
    //     [8, 8, 8, 8, 0],
    //     [0, 8, 0, 8, 0]
    // ]
]

function setup() {
    createCanvas(800, 800)

    colors = [
        // Nothing
        color(0, 0, 0, 0),
        // O
        color(255, 255, 0),
        // I
        color(0, 255, 255),
        // S
        color(0, 255, 0),
        // Z
        color(255, 0, 0),
        // L
        color(255, 128, 0),
        // J
        color(0, 0, 255),
        // T
        color(255, 0, 255),
        // AMOGUS
        color(255, 120, 0)
    ]
    spawnPiece()
}

function draw() {
    background(51)
    stroke(0)

    drawBoard(ground)
    drawBoard(air)

    fill(255, 255, 255)
    rect(400, 0, 400, 800)

    clearLines()
    if (frameCount % 50 == 0) {
        move(0, 1)
    }

    drawHeld()
    drawComingUp()
}

function drawBoard(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            fill(colors[board[i][j]])
            rect(j * 40, i * 40, 40, 40)
        }
    }
}

function clearBoard(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = 0
        }
    }
}

function putOnBoard(piece, board, pos) {
    let xPos = floor(pos[0] - piece[0].length / 2)
    let yPos = floor(pos[1])
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            board[y + yPos][x + xPos] = piece[y][x]
        }
    }
}

function clearLines() {
    let linesToClear = []
    let oldBoard = ground
    for (let y = 0; y < ground.length; y++) {
        let blockCount = 0
        for (let x = 0; x < ground[y].length; x++) {
            if (ground[y][x] !== 0) {
                blockCount++
            }
        }
        if (blockCount == 10) {
            linesToClear.push(y)
        }
    }

    for (let y = 0; y < ground.length; y++) {
        if (linesToClear.includes(y)) {
            for (let x = 0; x < ground[y].length; x++) {
                ground[y][x] = 0
            }

            // move the rest of them down 1
            for (let i = y; i > 0; i--) {
                ground[i] = oldBoard[i - 1]
            }

            ground[0] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    }
}

function rotatePiece(piece) {
    // copy piece and xy switch
    let output = [...Array(piece[0].length)].map(e => Array(piece.length).fill(0))
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            output[x][y] = piece[y][x]
        }
    }

    // flip x
    let output1 = [...Array(piece[0].length)].map(e => Array(piece.length).fill(0))
    for (let y = 0; y < output.length; y++) {
        for (let x = 0; x < output[y].length; x++) {
            output1[y][x] = output[y][output[y].length - x - 1]
        }
    }
    return output1
}

function mergeBoards() {
    for (let i = 0; i < ground.length; i++) {
        for (let j = 0; j < ground[i].length; j++) {
            if (air[i][j] !== 0) {
                ground[i][j] = air[i][j]
            }
        }
    }
    clearBoard(air)
}

function checkCollisions() {
    for (let i = 0; i < ground.length; i++) {
        for (let j = 0; j < ground[i].length; j++) {
            if (air[i][j] !== 0 && ground[i][j] !== 0) {
                if (air[0][j] !== 0 && ground[0][j] !== 0) {
                    location.reload()
                }
                return true
            }
        }
    }

    for (let i = 0; i < currentPiece.length; i++) {
        for (let j = 0; j < currentPiece[i].length; j++) {
            const xPos = currentPos[0] - currentPiece[0].length / 2 + j
            const yPos = currentPos[1] + i + 1
            if (yPos < 0 || xPos < 0 || xPos >= 10) {
                return true
            }
        }
    }

    return false
}

let currentPiece
let currentPos = []
let comingUp = []
function spawnPiece() {
    // let piece = pieces[floor(random(pieces.length))]
    while (comingUp.length < 3) {
        comingUp.push(pieces[floor(random(pieces.length))])
    }
    let piece = comingUp[0]
    comingUp.splice(0, 1)
    comingUp.push(pieces[floor(random(pieces.length))])
    currentPiece = piece
    currentPos = [5, 0]

    putOnBoard(piece, air, [5, 0])
}

let heldPiece
function holdPiece() {
    if (heldPiece) {
        const oldPiece = currentPiece
        currentPiece = heldPiece
        heldPiece = oldPiece
        currentPos = [5, -1]
    }
    else {
        heldPiece = currentPiece
        clearBoard(air)
        spawnPiece()
    }
}

function drawHeld() {
    if (heldPiece) {
        const yOff = 760 - heldPiece.length * 40
        fill(0, 0, 0)
        textSize(20)
        textAlign(CENTER)
        text("Held Piece:", 600, yOff - 10)
        for (let i = 0; i < heldPiece.length; i++) {
            for (let j = 0; j < heldPiece[i].length; j++) {
                noStroke()
                fill(colors[heldPiece[i][j]])
                rect(500 + j * 40, yOff + i * 40, 40, 40)
            }
        }
    }
}

function drawComingUp() {
    let yOff = 0
    for (let i = 0; i < comingUp.length; i++) {
        yOff += 40
        if (comingUp[i - 1]) { yOff += comingUp[i - 1].length * 40 }

        for (let j = 0; j < comingUp[i].length; j++) {
            for (let k = 0; k < comingUp[i][j].length; k++) {
                noStroke()
                fill(colors[comingUp[i][j][k]])
                rect(500 + k * 40, yOff + j * 40, 40, 40)
            }
        }
    }

}

function move(x, y) {
    if (currentPos[1] + currentPiece.length == 19 && y > 0) {
        clearBoard(air)
        currentPos = [currentPos[0] + x, currentPos[1] + 1]
        putOnBoard(currentPiece, air, currentPos)

        if (checkCollisions()) {
            currentPos[1] = 19 - currentPiece.length
            clearBoard(air)
            putOnBoard(currentPiece, air, currentPos)
            mergeBoards()
            spawnPiece()
        }
        else {
            mergeBoards()
            spawnPiece()
        }

    } else {
        clearBoard(air)
        currentPos = [currentPos[0] + x, currentPos[1] + y]

        putOnBoard(currentPiece, air, currentPos)


        if (checkCollisions()) {
            if (x !== 0) {
                move(-x, 0)
            }
            if (y > 0) {
                move(0, -1)
                mergeBoards()
                spawnPiece()
            }
        }
    }
}

function rotation() {
    clearBoard(air)
    currentPiece = rotatePiece(currentPiece)

    putOnBoard(currentPiece, air, currentPos)

    if (checkCollisions()) {
        clearBoard(air)
        currentPiece = rotatePiece(rotatePiece(rotatePiece(currentPiece)))

        putOnBoard(currentPiece, air, currentPos)
    }
}

function getGhostPiece() {
    const oldPos = currentPos
    while (!checkCollisions()) {
        clearBoard(air)
        currentPos = [currentPos[0], currentPos[1] + 1]
        putOnBoard(currentPiece, air, currentPos)
    }
    clearBoard(air)
    currentPos = [currentPos[0], currentPos[1] - 1]
    putOnBoard(currentPiece, air, currentPos)
    // console.log(checkCollisions())
    putOnBoard(currentPiece, ground, currentPos)
    currentPos = oldPos
}

// I need a better way of doing this
document.addEventListener('keypress', (event) => {
    if (event.code == "KeyA") {
        move(-1, 0)
    }
    if (event.code == "KeyD") {
        move(1, 0)
    }
    if (event.code == "KeyW") {
        rotation()
    }
    if (event.code == "KeyS") {
        move(0, 1)
    }
    if (event.code == "KeyC") {
        holdPiece()
    }
    if (event.code == "KeyV") {
        getGhostPiece()
    }
}, false)

// document.getElementById("music").play()