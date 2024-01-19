let randoms = []

let circleMask
let outline
function setup() {
  createCanvas(330, 330);
  noStroke()

  circleMask=createGraphics(330, 330)
  circleMask.noStroke()
  outline=createGraphics(330, 330)
  outline.noStroke()

  for(let i=0;i<14;i++){
    randoms.push(p5.Vector.random2D().setMag(600).add(createVector(330/2, 330/2)))
  }
}

t=0
function draw() {
  blendMode(BLEND)
  background(0);
  
  t = t+deltaTime/1000
  const mix = t/10

  // reset it
  if(t>10){
    t=0
    randoms=[]
    for(let i=0;i<14;i++){
      randoms.push(p5.Vector.random2D().setMag(600).add(createVector(330/2, 330/2)))
    }
  }

  // face
  fill(255)
  interpolateRect(
    randoms[0].x, randoms[0].y, 0, 0, 201, 201, mix
  )
  interpolateRect(
    randoms[1].x, randoms[1].y, 0, 0, 194, 280, mix
  )
  interpolateRect(
    randoms[2].x, randoms[2].y, 147, 220, 34, 110, mix
  )

  fill(0)
  interpolateRect(
    randoms[3].x, randoms[3].y, 0, 0, 192, 198, mix
  )
  interpolateRect(
    randoms[4].x, randoms[4].y, 0, 0, 167, 277, mix
    )
  interpolateRect(
    randoms[5].x, randoms[5].y, 150, 201, 30, 28, mix
    )
  interpolateRect(
    randoms[6].x, randoms[6].y, 150, 235, 30, 42, mix
  )
  interpolateRect(
    randoms[7].x, randoms[7].y, 0, 277, 125, 100, mix
    )

  fill(255)

  // eye
  fill(255)
  interpolateRect(randoms[8].x, randoms[8].y, 85, 70, 75, 72, mix)

  fill(0)
  interpolateRect(randoms[9].x, randoms[9].y, 80, 72, 77, 72, mix)

  fill(255)
  interpolateRect(randoms[10].x, randoms[10].y, 112, 72, 46, 43, mix)

  // circles
  circleMask.background(0)
  interpolateCircle(circleMask, randoms[11].x, randoms[11].y, 330/2, 330/2, 294, mix)
  blendMode(MULTIPLY)
  image(circleMask, 0, 0, width, height)

  outline.background(0)
  outline.fill(255)
  interpolateCircle(outline, randoms[12].x, randoms[12].y, 330/2, 330/2, 294, mix)
  outline.fill(0)
  interpolateCircle(outline, randoms[13].x, randoms[13].y, 330/2, 330/2, 290 , mix)

  blendMode(ADD)
  image(outline, 0, 0, width, height)
}

function interpolateRect(startPosX, startPosY,  endPosX, endPosY, width, height, mix){
  mix = 1-Math.pow(1-mix, 4)
  rect(
    startPosX*(1-mix) + endPosX*(mix),
    startPosY*(1-mix)+endPosY*(mix),
    width, height
  )
}

function interpolateCircle(target, startPosX, startPosY,  endPosX, endPosY, diameter, mix){
  mix = 1-Math.pow(1-mix, 4)
  target.circle(
    startPosX*(1-mix) + endPosX*(mix),
    startPosY*(1-mix)+endPosY*(mix),
    diameter
  )
}