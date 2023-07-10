const bpm = 120
const subBPM = bpm

let previewPolysynth

let startTime, timeSinceStart, recording
let t = 0 //time since page load

let thisBundle = {}
let savedBundles = {}

let metronome
let metronomePlaying = false

let bpmCalculating = false
let bpmSoonCalculating = false
let bpmBeats = []

function setup() {
    createCanvas(400, 400)
    userStartAudio() //?
    startTime = 0
    timeSinceStart = 0
    recording = false

    metronome = new p5.Oscillator(400, "sine")

    previewPolysynth = new p5.PolySynth()
}

function draw() {
    if (metronomePlaying) {
        background(255 - (255 * Math.abs(Math.sin(t * (Math.PI * bpm) / 60))))

        const shortness = 20
        const metronomeAmount = shortness * (
            Math.max(
                Math.abs(
                    Math.sin(
                        (timeSinceStart + 30 / bpm) *
                        ((Math.PI * bpm) / 60)
                    )
                ) - (1 - 1 / shortness)
                , 0)
        )
        metronome.amp(metronomeAmount * 0.3)
    }
    else {
        background(51)
    }

    if (recording) {
        fill("red")
        rect(0, 0, 50, 50)
    }

    if (bpmCalculating) {
        fill("blue")
        rect(50, 0, 50, 50)
    }

    t += deltaTime / 1000

    timeSinceStart = t - startTime
}

function keyPressed() {
    if (keyCode == 32) {
        if (!recording) { thisBundle = {} } //change this later on to have multiple Bundles
        else { thisBundle = cleanUpBundle(thisBundle) }
        recording = !recording
        startTime = t
    }

    if (keyCode == 77) { //m
        if (metronomePlaying) {
            metronome.stop()
        } else {
            metronome.start()
        }
        metronomePlaying = !metronomePlaying
    }

    if (keyCode == 190) {//.
        playBundle(thisBundle)
    }

    if (keyCode == 188) { //,
        if (!bpmCalculating && !bpmSoonCalculating) {
            bpmSoonCalculating = true
            setTimeout(function () { bpmCalculating = true }, 1000)
            setTimeout(function () {
                bpmCalculating = false

                console.log(60 * bpmBeats.length / (bpmBeats[bpmBeats.length - 1] - bpmBeats[0]))

                bpmBeats = []
            }, 6000)
            setTimeout(function () { bpmSoonCalculating = false }, 8000) // couple seconds of cooldown
        }
        if (bpmCalculating) {
            bpmBeats.push(t)
        }
    }

    if (keys[keyCode]) {
        if (thisBundle[keyCode] == undefined) { thisBundle[keyCode] = [] }
        thisBundle[keyCode].push([snapTimeToBPM(timeSinceStart, bpm)])

        previewPolysynth.noteAttack(keys[keyCode][1], 1)
    }

    if (keyCode == 39) {
        for (let i = 48; i <= 57; i++) {
            if (keyIsDown(i)) {
                let bundle = savedBundles[i]
                for (let key in bundle) {
                    for (let j = 0; j < bundle[key].length; j++) {
                        bundle[key][j][0] = bundle[key][j][0] / 2
                        bundle[key][j][1] = bundle[key][j][1] / 2
                    }
                }
            }
        }
    }
}

function keyReleased() {
    if (keys[keyCode]) {
        let thisTime = snapTimeToBPM(timeSinceStart, subBPM)
        let thisArray = thisBundle[keyCode][thisBundle[keyCode].length - 1]
        if (thisArray[0] >= thisTime) { thisTime = thisArray[0] + 60 / (bpm * 2) }
        thisArray.push(thisTime)

        previewPolysynth.noteRelease(keys[keyCode][1])
    }

    // saving keys (number keys)
    if (keyCode >= 48 && keyCode <= 57) {
        if (keyIsDown(83)) {//s
            savedBundles[keyCode] = thisBundle
        }
        else {
            playBundle(savedBundles[keyCode])
        }
    }
}

function snapTimeToBPM(time, bpm) {
    const spb = 60 / bpm //seconds per beat
    return Math.round(time / spb) * spb
}

function cleanUpBundle(bundle) {
    let output = {}
    for (let keyNum in bundle) {
        let key = bundle[keyNum]
        output[keyNum] = []

        let currentStartTime = 0
        let latestEndTime = 0
        for (let i = 0; i < key.length; i++) {
            if (currentStartTime != key[i][0] && i != 0) { //new note, add the old one to output
                output[keyNum].push([currentStartTime, latestEndTime])
                latestEndTime = 0
            }

            currentStartTime = key[i][0]
            if (key[i][1] > latestEndTime) { latestEndTime = key[i][1] }
        }
        output[keyNum].push([currentStartTime, latestEndTime])
    }

    return output

}

const transitionTime = 0.3//might not be right
function playBundle(bundle) {
    let oscillators = {}
    for (let keyNum in bundle) {
        oscillators[keyNum] = new p5.Oscillator(keys[keyNum][2], "sine")
        let osc = oscillators[keyNum]
        osc.start()
        osc.amp(0, 0)

        for (let i = 0; i < bundle[keyNum].length; i++) {
            setTimeout(function () { osc.amp(1, transitionTime) }, bundle[keyNum][i][0] * 1000)
            setTimeout(function () { osc.amp(0, transitionTime) }, bundle[keyNum][i][1] * 1000)
        }
    }

    return oscillators
}

const keys = {
    81: ["q", "A4", 220],
    87: ["w", "Bb4", 223.08],
    69: ["e", "B4", 246.94],
    82: ["r", "C4", 261.63],
    84: ["t", "Db4", 277.18],
    89: ["y", "D4", 293.66],
    85: ["u", "Eb4", 311.13],
    73: ["i", "E4", 329.63],
    79: ["o", "F4", 349.23],
    80: ["p", "Gb4", 369.99],
    219: ["[", "G4", 392],
    221: ["]", "Ab5", 415.30]
}
//? b and m for pitch up and down

// save bundle to number ~
// select and speed/pitch bundle ~
// ?preview plays unexpectedly after a while
    //? dont rely on setTimeout

// !plays infinitely if I stop the recording while holding a key

// *rework replay to allow for sped up bundles
    // custom ADSR using a function to pass in time attack-release which sets up a few setTimeouts
// *rework preview to not clip

// * use beats instead of seconds in bundles

// *make a display for the calculated bpm instead of console.log

// *to make it work with pitching up and down, bundles need to have notes listed under their pitch, not their key number

// wrtuuyupopopopopo]opouopo
//  https://music.youtube.com/watch?v=M_oobzkXcIs&list=PL0phUzFhhvnNnX_26ybcSK6ZDRgPM2JRL