let c
function setup() {
  c = createGraphics(24, 42)
  c.pixelDensity(1)
  c.noSmooth()
  c.noStroke()

  createCanvas(c.width*10, c.height*10);
  pixelDensity(1)
  noSmooth()

  noLoop()
}

function draw() {
  c.background(255, 0, 0);
  c.rect(2, 10, 1, 1)
  c.rect(5, 10, 1, 1)

  const grayShade = random(70, 150)
  const gray = [grayShade, grayShade, grayShade]
  const grayDarker =  [grayShade*0.8, grayShade*0.8, grayShade*0.8]

  const colorHSL = [random(), 1, 0.4]
  const color = hslToRgb(colorHSL[0], colorHSL[1], colorHSL[2])
  const colorLight = hslToRgb(colorHSL[0], colorHSL[1], colorHSL[2]*2)
  const colorWhite = hslToRgb(colorHSL[0], colorHSL[1], 0.97)

  for(let j=0;j<7;j++){
    const oneColorsInThisRow = pickRandomOf(12, 4)
    
    const oneColorsValues = pickOneColorsForThisRow(colorLight, colorWhite, gray, grayDarker)
    let oneColorsDrawn = 0
    for (let i=0;i<12;i++){
      if(oneColorsInThisRow.includes(i)){ //it is one solid colour 
        c.fill(oneColorsValues[oneColorsDrawn])
        c.rect(i*2, j*6, 2, 6)
        oneColorsDrawn++
      }

      else{ //this block will have two colours
        let colors = pickRandomCombinationOfTwoColors([color, gray, [0, 0, 0]])
        for(let k=0;k<3;k++){
          c.fill(colors[0][0],colors[0][1],colors[0][2])
          c.rect(i*2, j*6+k*2, 2, 1)
          c.fill(colors[1][0],colors[1][1],colors[1][2])
          c.rect(i*2, j*6+k*2+1, 2, 1)
        }
      }
    }
  }

  image(c, 0, 0, width, height)
}

// the colors passed in will be "color", "gray", and black
function pickRandomCombinationOfTwoColors(colors){
  const firstColor = Math.floor(random(3))

  let secondColor = Math.floor(random(3))
  while (secondColor==firstColor){
    secondColor = Math.floor(random(3))
  }

  return [colors[firstColor], colors[secondColor]]
}

function pickOneColorsForThisRow(colorLight, colorWhite, gray, grayDarker){
  let output = []

  const grays = pickRandomOf(4, Math.floor(random(2)+1))
  for (let i=0;i<4;i++){
    if (grays.includes(i)){ //it's a gray, so pick either the lighter or darker version
      if(Math.floor(random(2))==1){
        output.push(gray)
      }else{
        output.push(grayDarker)
      }
    }
    else{
      if(Math.floor(random(2))==1){
        output.push(colorLight)
      }else{
        output.push(colorWhite)
      }
    }
  }

  return output
}

// also makes sure that the numbers picked arent next to eachother (can cause an infinite loop if that's not possible)
function pickRandomOf(numberOfItems, amountToPick){
  let output = []
  for (let i=0;i<amountToPick;i++){
    let v = Math.floor(random(numberOfItems))
    while (output.includes(v) || output.includes(v+1) || output.includes(v-1)){ //cant be a chosen number, or next to a chosen number
      v = Math.floor(random(numberOfItems))
    }
    output.push(v)
  }
  return output
}

// https://gist.github.com/mjackson/5311256
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255
  var max = Math.max(r, g, b), min = Math.min(r, g, b)
  var h, s, l = (max + min) / 2
  if (max == min) {
      h = s = 0 // achromatic
  } else {
      var d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
      }
      h /= 6
  }
  return [h, s, l]
}
function hslToRgb(h, s, l) {
  var r, g, b
  if (s == 0) {
      r = g = b = l // achromatic
  } else {
      function hue2rgb(p, q, t) {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s
      var p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
  }
  return [r * 255, g * 255, b * 255]
}

// 7 rectangles down, 12 across
// each rectangle has 6 widthwise rectangles arranged vertically
//  or is just one color
//  its it's two, one is black and the other is not one of the light colours
//    the light colors are light versions of the dark colours
//  in a row, 8 have two colors and 4 have 1
// width of these rectangles is about twice the height
// can say its 24 squares across and 42 up/down
// none of the one-colors are next to each other
// there is never only one light one-color

// one color is a gray, and there also a slightly darker version of it
// the other colors are shades of yellow, dark, pale, and almost white

//? add a subtle displacement and canvas effect