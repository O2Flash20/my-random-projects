let c
function setup() {
  createCanvas(800, 800)

  createP("<br>The triangle that's being tiled:")
  c=createGraphics(87, 50)

  frameRate(1)
}

function draw() {
  background(220);

  c.background(255)
  drawTriangle(Math.floor(random(4, 6)))

  for(let k=0;k<8;k++){
    let xOffset=0
    if (k%2==0){
      xOffset = 87
    }
    for (let j=0;j<8;j++){
      for(let i=0;i<6;i++){
        push()
        
        translate(j*174+xOffset, k*150)
        rotate(i*360/6 * (PI/180))
        image(c, 0, 0 )
        
        scale(1, -1)
        image(c, 0, 0)
        pop()
      }
    }
  }
}

function drawTriangle(lines){
  c.noErase()
  c.stroke(0)
  for(let i=0;i<lines;i++){
    const startPos = p5.Vector.random2D().setMag(100)
    const midPos = createVector(random(87), random(50))
    const endPos = p5.Vector.random2D().setMag(100)
    const thisColor = hslToRgb(random(), 1, 0.4)
    c.fill(thisColor[0], thisColor[1], thisColor[2])
    c.beginShape(TRIANGLES)
    c.vertex(startPos.x, startPos.y)
    c.vertex(midPos.x, midPos.y)
    c.vertex(endPos.x, endPos.y)
    c.endShape()
  }

  c.erase()
  c.triangle(0, 1, 87, 52, 0, 50)
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