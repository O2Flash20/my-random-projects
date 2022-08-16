let color = []

function setup() {
  createCanvas(400, 400)
  color = [random(255), random(255), random(255)]
  fill(color[0], color[1], color[2])
  rect(0, 0, 400, 400)
}

function draw() {
  // background(220)
}

function rgbToHex(r, g, b) {
  return decimalToHex(r) + decimalToHex(g) + decimalToHex(b)
}

function hexToRGB(hex) {
  let rgb = []
  for (let i = 0; i < hex.length; i += 2) {
    rgb.push(hexToDecimal(hex.charAt(i) + hex.charAt(i + 1)))
  }
  return rgb
}

const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", '8', "9", "a", "b", "c", "d", "e", "f"]
function decimalToHex(input) {
  const first = floor(input / 16)
  const second = input - first * 16
  const firstS = symbols[first]
  const secondS = symbols[second]
  return firstS + secondS
}

function hexToDecimal(input) {
  const first = symbols.indexOf(input.charAt(0))
  const second = symbols.indexOf(input.charAt(1))
  return 16 * first + second
}

function submitGuessHex(hex) {
  const guess = hexToRGB(hex)
  // console.log(dist(color[0], color[1], color[2], guess[0], guess[1], guess[2]))
  displayPercent(dist(color[0], color[1], color[2], guess[0], guess[1], guess[2]))
  // return dist(color[0], color[1], color[2], guess[0], guess[1], guess[2])
}

function submitGuessRGB(input) {
  let guess = input.split(",")
  for (let i = 0; i < guess.length; i++) {
    guess[i] = parseFloat(guess[i])
  }
  fill(guess[0], guess[1], guess[2])
  rect(10, 10, 30, 30)
  // console.log(dist(color[0], color[1], color[2], guess[0], guess[1], guess[2]))
  displayPercent(dist(color[0], color[1], color[2], guess[0], guess[1], guess[2]))
}

function displayPercent(input) {
  alert(floor(map(input, 0, 441.67, 100, 0)) + "%")
}

document.getElementById("RGBEnter").addEventListener("click", function () {
  submitGuessRGB(document.getElementById("RGBIn").value)
})

document.getElementById("hexEnter").addEventListener("click", function () {
  submitGuessHex(document.getElementById("hexIn").value)
})

document.getElementById("correctReveal").addEventListener("click", function () {
  alert(floor(color[0]) + " " + floor(color[1]) + " " + floor(color[2]) + " (Hex: " + rgbToHex(floor(color[0]), floor(color[1]), floor(color[2])) + ")")
})