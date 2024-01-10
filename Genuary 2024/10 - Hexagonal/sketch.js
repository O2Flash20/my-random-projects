let points

function setup() {
  createCanvas(600, 600);
  points = subdividePointsList(
    generateHexagonPoints(200), 
    100
  )
  stroke("white")
}

let t = 0
function draw() {
  background(51);

  translate(width/2, height/2)
  
  // const pointsToDraw = lerpPointsListToCircle(points, (Math.sin(t)+1)/2, 200)
  // const pointsToDraw = lerpPointsListToSquare(points, (Math.sin(t)+1)/2, 200)
  // drawPointsList(pointsToDraw)
  drawPointsList(
    lerpPointsListToSquare(points, (Math.sin(t)+1)/2, 200)
  )
  drawPointsList(
    lerpPointsListToCircle(points, (Math.sin(t)+1)/2, 200)
  )
  drawPointsList(
    lerpPointsListToTriangle(points, (Math.sin(t)+1)/2, 200)
  )

  t+=deltaTime/1000
}

function generateHexagonPoints(radius){
  let output = []

  let point = createVector(radius, 0)
  for (let i =0; i < 6; i++){
    output.push(point.copy().rotate(i * Math.PI/3))
  }

  return output
}

function subdividePointsList(pointsList, amount){
  let output =[]

  for(let i = 0; i < pointsList.length; i++){
    for (j=0; j<amount;j++){ //between every two original points, add `amount` more
      const pointBefore = pointsList[i].copy()
      const pointAfter = pointsList[(i+1)%pointsList.length].copy()
      output.push(pointBefore.lerp(pointAfter, j/amount))
    }
  }

  return output
}

function drawPointsList(pointsList){
  for(let i = 0; i < pointsList.length-1; i++){
    line(pointsList[i].x, pointsList[i].y, pointsList[i+1].x, pointsList[i+1].y)
  }
  line(pointsList[pointsList.length-1].x, pointsList[pointsList.length-1].y, pointsList[0].x, pointsList[0].y)
}

function lerpPointsListToCircle(pointsList, amount, circleRadius){
  let output = []
  for (let i=0; i<pointsList.length; i++){
    output.push(pointsList[i].copy().lerp(pointsList[i].copy().normalize().mult(circleRadius), amount))
  }
  return output
}

function lerpPointsListToSquare(pointsList, amount, squareRadius){
  let output = []

  const pointsOnCircle = lerpPointsListToCircle(pointsList, 1, Math.sqrt(2)*squareRadius) //projects the points onto a circle first so that they're more evenly spaced when turned into a square. the sqrt(2) makes it so that there's a point on each corner of the square
  for (let i=0; i<pointsList.length; i++){
    // const p = pointsList[i]
    const p = pointsOnCircle[i]
    let pointOnSquare
    
    if(p.x > 0 && p.x >= Math.abs(p.y)){ //it should go to the right edge of the square
      pointOnSquare = createVector(squareRadius, p.y)
    }
    if(p.x < 0 && -p.x >= Math.abs(p.y)){ //it should go to the left edge of the square
      pointOnSquare = createVector(-squareRadius, p.y)
    }

    if(p.y > 0 && p.y >= Math.abs(p.x)){ //it should go to the top edge of the square
      pointOnSquare = createVector(p.x, squareRadius)
    }
    if(p.y < 0 && -p.y >= Math.abs(p.x)){ //it should go to the top edge of the square
      pointOnSquare = createVector(p.x, -squareRadius)
    }

    output.push(pointsList[i].copy().lerp(pointOnSquare, amount))
  }
  return output
}

function lerpPointsListToTriangle(pointsList, amount, triangleBase){ //equilateral, so base==height
  let output = []

  const pointsOnCircle = lerpPointsListToCircle(pointsList, 1, Math.sqrt(2)*triangleBase) //projects the points onto a circle first so that they're more evenly spaced when turned into a square. the sqrt(2) makes it so that there's a point on each corner of the square
  for (let i=0; i<pointsList.length; i++){
    const p = pointsOnCircle[i].setMag(100)
    let pointOnTriangle
    
    const intDown = findIntersection(0, 0, p.x, p.y, -triangleBase, -triangleBase, triangleBase, -triangleBase)
    if (intDown!== null){ //the point should go to the bottom edge
      pointOnTriangle = intDown
    }

    const intLeft = findIntersection(0, 0, p.x, p.y, -triangleBase, -triangleBase, 0, triangleBase)
    if (intLeft!== null){ //the point should go to the left edge
      pointOnTriangle = intLeft
    }

    const intRight = findIntersection(0, 0, p.x, p.y, triangleBase, -triangleBase, 0, triangleBase)
    if (intRight!== null){ //the point should go to the right edge
      pointOnTriangle = intRight
    }

    // console.log(pointsList[i], pointOnTriangle)

    output.push(pointsList[i].copy().lerp(pointOnTriangle, amount))
  }
  return output
}

function findIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  if (x1 === x2) {  // Line 1 is vertical
      const t2 = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
      const intersectionX = x1
      const intersectionY = y3 + t2 * (y4 - y3)
      return createVector(intersectionX, intersectionY)
  } else if (x3 === x4) {  // Line 2 is vertical
      const t1 = ((x3 - x1) * (y3 - y4) - (y3 - y1) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
      const intersectionX = x3
      const intersectionY = y1 + t1 * (y2 - y1)
      return createVector(intersectionX, intersectionY)
  } else {
      // Standard case for non-vertical lines
      const t1 = ((x3 - x1) * (y3 - y4) - (y3 - y1) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
      const t2 = ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
      const intersectionX = x1 + t1 * (x2 - x1)
      const intersectionY = y1 + t1 * (y2 - y1)

      // Check if the intersection point is within the line segments
      if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
          return createVector(intersectionX, intersectionY)
      } else {
          return null
      }
  }
}
