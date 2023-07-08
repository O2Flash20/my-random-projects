const bpm = 120
const subBPM = bpm * 2

let previewPolysynth

let startTime, timeSinceStart, recording
let t = 0 //time since page load

let thisBundle = {}

let metronome
let metronomePlaying = false

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

    if (keys[keyCode]) {
        if (thisBundle[keyCode] == undefined) { thisBundle[keyCode] = [] }
        thisBundle[keyCode].push([snapTimeToBPM(timeSinceStart, bpm)])

        previewPolysynth.noteAttack(keys[keyCode][1], 1)
    }
}

function keyReleased() {
    if (keys[keyCode]) {
        let thisTime = snapTimeToBPM(timeSinceStart, subBPM)
        let thisArray = thisBundle[keyCode][thisBundle[keyCode].length - 1]
        if (thisArray[0] >= thisTime) { thisTime = thisArray[0] + 60 / subBPM }
        thisArray.push(thisTime)

        previewPolysynth.noteRelease(keys[keyCode][1])
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

const transitionTime = 0.3 //might not be right
function playBundle(bundle) {
    let oscillators = {}
    for (let keyNum in bundle) {
        oscillators[keyNum] = new p5.Oscillator(keys[keyNum][2], "sine")
        let osc = oscillators[keyNum]
        osc.start()
        osc.amp(0, 0)

        for (let i = 0; i < bundle[keyNum].length; i++) {
            setTimeout(function () { osc.amp(1, transitionTime) }, bundle[keyNum][i][0] * 1000 - (transitionTime * 1000))
            setTimeout(function () { osc.amp(0, transitionTime) }, bundle[keyNum][i][1] * 1000 - (transitionTime * 1000))
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

// *bpm calculator
// *fix preview "clipping"?