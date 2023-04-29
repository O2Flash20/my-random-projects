const size = 500

let cellsShader
let cellsBuffer
let blurShader
let blurBuffer

let TestLayer

function preload() {
    cellsShader = loadShader("basic.vert", "cells.frag")
    blurShader = loadShader("basic.vert", "blur.frag")
}

function setup() {
    createCanvas(size, size)

    cellsBuffer = createGraphics(size, size, WEBGL)
    blurBuffer = createGraphics(size, size, WEBGL)

    TestLayer = createGraphics(size, size)

    inits()
}

function draw() {
    background(51)

    noLoop()
}

function inits() {
    cellsBuffer.shader(cellsShader)
    blurBuffer.shader(blurShader)
}

function cells(Layer, numberOfPoints, exposure, seed) {
    cellsShader.setUniform("uNumberOfPoints", numberOfPoints)
    cellsShader.setUniform("uExposure", exposure)
    cellsShader.setUniform("uSeed", seed)

    cellsBuffer.shader(cellsShader)
    cellsBuffer.rect(0, 0, size, size)

    Layer.image(cellsBuffer.get(), 0, 0)
}

// amount: 0-1
function blur(Layer, amount) {
    blurShader.setUniform("uLayer", Layer)
    blurShader.setUniform("uAmount", amount)

    blurBuffer.shader(blurShader)
    blurBuffer.rect()
}

/*
interval to set all the uniforms then draw to all the buffers one by one

some format i decide (where the user types stuff in) -->
array of instructions, strings which lead to a function [instructionName, [parameters]] -->
code executing, finally making an image

list for instruction names to function
effects = {
    cellNoiseParam = function cells(numberOfPoints, exposure, seed){
        cellsShader.setUniform("uNumberOfPoints", numberOfPoints)
        cellsShader.setUniform("uExposure", exposure)
        cellsShader.setUniform("uSeed", seed)
    },
    cellNoiseRender = function cellsDraw(){
        cellsBuffer.shader(cellsShader)
        cellsBuffer.rect(0, 0, size, size)
    },
    cellNoiseShift = function cellsShift(layer){
        layer.img = cellsBuffer.canvas
    }
}

Layer Test:
    Cell Noise: numberOfPoints, exposure, seed
    etc
TURNS INTO
[ ["cellNoiseParam", [numberOfPoints, exposure, seed]], ["cellNoiseRender"], ["cellNoiseShift", ["Test"]] ]

also need:
    groups
    color mapping on individual layers?
    final modifications to the full image
*/