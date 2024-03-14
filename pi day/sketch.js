let graphC
function setup(){
  createCanvas(500, 500)
  background(51)
  ellipse(250, 250, 500)
  noStroke()
  fill(255, 0, 0)

  graphC = createGraphics(500, 100)
}

let valuesFound = []

let numInCircle = 0
let drawn = 0
let t = 0
let highestError = 0
let lowestError = 100
function draw(){
  let pointPos
  for(let i = 0; i < 100; i++){
    pointPos = createVector(Math.random()-0.5, Math.random()-0.5).mult(2)
    if(pointPos.magSq() < 1){
      numInCircle++
    }
    drawn++

  }
  ellipse(pointPos.x*250 + 250, pointPos.y*250 + 250, 3)

  const thisCalculatedPi = 4*(numInCircle/drawn)
  const thisError = piPercentError(thisCalculatedPi)

  if (thisError < lowestError){
    lowestError = thisError
  }
  else if( thisError > highestError){
    highestError = thisError
  }

  document.getElementById("pInSquare").innerText = drawn
  document.getElementById("pInCircle").innerText = numInCircle
  document.getElementById("piVal").innerText = thisCalculatedPi

  valuesFound.push([t, thisError])

  graphC.background(120)
  graphC.fill(0)
  const timeScale = 500 / valuesFound[valuesFound.length-1][0]
  for(let i=0;i<valuesFound.length; i++){
    graphC.ellipse(valuesFound[i][0]*timeScale, map(valuesFound[i][1], lowestError, highestError, 0, 100), 3)
  }
  
  t+=deltaTime/1000
}

function piPercentError(value){
  return Math.abs(value-Math.PI)/Math.PI
}