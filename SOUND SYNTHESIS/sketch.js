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
        let thisFreq = keys[keyCode][2]
        if (thisBundle[thisFreq] == undefined) { thisBundle[thisFreq] = [] }
        thisBundle[thisFreq].push([Math.round(bpm * timeSinceStart / 60)])

        previewPolysynth.noteAttack(keys[keyCode][1], 1)
    }

    // controlling aa bundle
    for (let i = 48; i <= 57; i++) {
        if (keyIsDown(i)) {
            let bundle = savedBundles[i]
            if (keyCode == 39) { //right arrow, speed up
                savedBundles[i] = retimeBundle(bundle, 2)
            }
            if (keyCode == 37) { //left arrow, slow down
                savedBundles[i] = retimeBundle(bundle, 1 / 2)
            }
            if (keyCode == 38) { //up arrow, pitch up
                savedBundles[i] = pitchBundle(bundle, 23)
            }
            if (keyCode == 40) { //down arrow, pitch down
                savedBundles[i] = pitchBundle(bundle, -23)
            }
        }
    }
}

function keyReleased() {
    if (keys[keyCode]) {
        let thisBeat = Math.round(bpm * timeSinceStart / 60)
        let thisFreq = keys[keyCode][2]
        let thisArray = thisBundle[thisFreq][thisBundle[thisFreq].length - 1]
        if (thisArray[0] >= thisBeat) { thisBeat = thisArray[0] + 0.5 }
        thisArray.push(thisBeat)

        previewPolysynth.noteRelease(keys[keyCode][1])
    }

    // saving keys (to number keys)
    if (keyCode >= 48 && keyCode <= 57) {
        if (keyIsDown(83)) { //s
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

// puts together multiple of the same note that are playing at the same time
// *!make it so that the first beat is always 0
function cleanUpBundle(bundle) {
    let output = {}
    for (let freq in bundle) {
        let thisFrequency = bundle[freq]
        output[freq] = []

        let currentStartTime = 0
        let latestEndTime = 0
        for (let i = 0; i < thisFrequency.length; i++) {
            if (currentStartTime != thisFrequency[i][0] && i != 0) { //new note, add the old one to output
                output[freq].push([currentStartTime, latestEndTime])
                latestEndTime = 0
            }

            currentStartTime = thisFrequency[i][0]
            if (thisFrequency[i][1] > latestEndTime) { latestEndTime = thisFrequency[i][1] }
        }
        output[freq].push([currentStartTime, latestEndTime])
    }

    return output

}

function playBundle(bundle) {
    let oscillators = {}
    for (let frequency in bundle) {
        oscillators[frequency] = new p5.Oscillator(float(frequency), "sine")
        let osc = oscillators[frequency]
        osc.start()
        osc.amp(0, 0)

        for (let i = 0; i < bundle[frequency].length; i++) {
            playNote(
                osc,
                60 * (bundle[frequency][i][1] - bundle[frequency][i][0]) / bpm,
                60 * bundle[frequency][i][0] / bpm
            )
        }
    }

    return oscillators
}

function playNote(osc, timeHeld, timeUntilStart) {
    if (osc == undefined) { osc = new p5.Oscillator("sine"); osc.start() }
    if (timeUntilStart == undefined) { timeUntilStart = 0 }
    const attackTime = 0.1
    const decayTime = 0.3
    const sustainLevel = 0.6
    const releaseTime = 0.2
    setTimeout(function () { osc.amp(1, attackTime) }, (timeUntilStart) * 1000)
    setTimeout(function () { osc.amp(sustainLevel, decayTime) }, (timeUntilStart + attackTime) * 1000)
    setTimeout(function () { osc.amp(0, releaseTime) }, (timeUntilStart + attackTime + decayTime + timeHeld - releaseTime) * 1000)
}

function retimeBundle(bundle, speedMultiplier) {
    for (let key in bundle) {
        for (let j = 0; j < bundle[key].length; j++) {
            bundle[key][j][0] = bundle[key][j][0] / speedMultiplier
            bundle[key][j][1] = bundle[key][j][1] / speedMultiplier
        }
    }
    return bundle
}

function pitchBundle(bundle, frequencyChange) {
    let newBundle = {}

    for (let frequency in bundle) {
        let newFrequency = float(frequency) + frequencyChange
        newBundle[newFrequency] = bundle[frequency]
    }

    bundle = newBundle
    return bundle
}

const keys = {
    81: ["q", "A4", 220],
    87: ["w", "Bb4", 233.08],
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

// !plays infinitely if I stop the recording while holding a key

// *rework replay to allow for sped up bundles
    // custom ADSR using a function to pass in time attack-release which sets up a few setTimeouts
// *rework preview to not clip
// !still weird ^^^

// *make a display for the calculated bpm instead of console.log

// ?use something to get the frequencies of all the notes so that pitching up or down uses real notes

// wrtuuyupopopopopo]opouopo
//  https://music.youtube.com/watch?v=M_oobzkXcIs&list=PL0phUzFhhvnNnX_26ybcSK6ZDRgPM2JRL