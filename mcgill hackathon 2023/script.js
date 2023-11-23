let cameraScale = 0.7
let cameraPos
let timeScale = 1
const G = 6.67430 * 10**-11

let timeSinceStart = 0

//Creates class for grouping rocket function
class Rocket{
  constructor (pos, vel, mass, height, width, rot){
    this.pos = pos
    this.vel = vel
    this.acc = createVector(0, 0)
    this.mass = mass
    this.height = height
    this.width = width
    this.rot = rot
  }

  applyForce(force){
    this.acc.add(force.div(this.mass))
  }

  update(){
    this.vel.add(this.acc.copy().mult(timeScale*deltaTime/1000))
    this.pos.add(this.vel.copy().mult(timeScale*deltaTime/1000))
    // this.acc.mult(0)
  }

  draw(img){
    push()
    translate(this.pos.x, this.pos.y)
    rotate(this.rot)
    
    if(input_mem.includes(87)){
      push()
      rotate(PI)
      translate(-5, -40)
      image(imgThrust, 0, 0, 10, 10)
      pop()
    }
    
    imageMode(CENTER)
    image(img, 0, 0, this.width, this.height)

    pop()
  }
}
// [[x, y, a, col], [x, y, a, col]]
function radialGradient(sX, sY, sR, eX, eY, eR, tX, tY, tR, aX, aY, aR, colorS, colorE, colorT, colorA){
	let gradient = drawingContext.createRadialGradient(sX, sY, sR, eX, eY, eR, tX, tY, tR, aX, aY, aR);
	gradient.addColorStop(.25, colorS);
	gradient.addColorStop(0.5, colorE);
	gradient.addColorStop(0.9999999, colorT)
	gradient.addColorStop(1, colorA);
	drawingContext.fillStyle = gradient;
}
class Planet{
  constructor (pos, mass, radius){
    this.pos = pos
    this.mass = mass
    this.radius = radius
  }

  draw(colorS,colorE,colorT, colorA){
    // fill(col)
    noStroke()
		radialGradient(
			0, 0, this.radius/8,
			0, 0, this.radius/1.2,
			0, 0,this.radius/1000,
			0, 0, 1,
      colorS, colorE, colorT, colorA
		);
		
    push()
    translate(this.pos.x, this.pos.y)
    ellipse(0, 0, this.radius*2)
    pop()
  }
}
let endScreen = false
let distance = 0
let isReloading = false
function planetCollisions() {
  distanceEarth = dist(s5.pos.x, s5.pos.y, earth.pos.x, earth.pos.y)
	if (distanceEarth <= earth.radius + 30){
    const upness = Math.abs((-s5.pos.angleBetween(earth.pos)+3*PI/4) - s5.rot)
		if (s5.vel.mag() > 100){
			endScreen = true
			
    }
		else if (upness > PI/4){
			endScreen = true
    }
    else{
			let moveVector = p5.Vector.fromAngle(PI-(s5.pos.angleBetween(earth.pos)+3*PI/4), earth.radius + 19)
      s5.pos.set(moveVector)
			s5.vel.mult(0)
		}
  }
  
  distanceMoon = dist(s5.pos.x, s5.pos.y, moon.pos.x, moon.pos.y)
  if (distanceMoon <= moon.radius + 25){
  	if (s5.vel.copy().sub(getMoonVelocity((timeSinceStart*PI)/6000), PI/6000).mag() > 300){
  		endScreen = true
		}
		else{
      // let moveVector = p5.Vector.fromAngle((s5.pos.angleBetween(moon.pos)+3*PI/4), moon.radius + 15)
      let moveVector = s5.pos.copy().sub(moon.pos)
			s5.vel.set(getMoonVelocity((timeSinceStart*PI)/6000, PI/6000))
			s5.pos.set(moveVector.add(moon.pos))
 	  }	
  }	
}

let s5
let earth
let moon

let keys = {1: 49, A: 65, D: 68, S: 83, W: 87, X: 88, Y: 89, Z: 90, SPACE: 32}
let input_mem = []
function keyPressed() {
  input_mem.push(keyCode)
  // console.log(input_mem)
}

function keyReleased() {
  input_mem.splice(input_mem.indexOf(keyCode), 1)
}

function preload() {
  imgRocket = loadImage('ROCKET.png')
  // imgMoon = loadImage('MOON.png')
  // imgEarth = loadImage('EARTH.png')
  imgSpace = loadImage('SPACE.jpg')
	imgSad = loadImage('sad_moomin.png')
  imgThrust = loadImage("THRUST.png")
}

let warpSlider
function updateWarp(){
  timeScale = warpSlider.value()
}
function setup(){
  createCanvas(windowWidth, windowHeight);

  warpSlider = createSlider(0.5, 100, 1, 0.1)
  warpSlider.position(width-250, 10)
  warpSlider.mouseMoved(updateWarp)
  // warpSlider.style('width', '300px'); // Set the width of the slider
  warpSlider.style('height', '70px'); // Set the height of the slider
  // warpSlider.style('height', '500px');
  warpSlider.style("width", "250px")

  noStroke()
  cameraPos = createVector(0, 0)
  s5 = new Rocket(createVector(0, -6520), createVector(0, 0), 988333, 65, 13.5, 0)
  earth = new Planet(createVector(10, 10), 6.2*10**18, 6500)
  // moon = new Planet(createVector(0, 0), 735016800, 1737.5) // should remove the two zeroes at the end
  moon = new Planet(createVector(10, 10), 6.2*10**18,  1737.5)
  // moon = new Planet(createVector(0, 0), 6.2*10**18, 1737.5)
	let header = createElement('h1', 'Shmooman Shmoon Program\n\n')
	let header22 = createElement('h3',"Land on the Schmoon and save the shmoomen!") 
	let header2 = createElement('h2', 'CONTROLS')
	let header3 = createElement('h3', 'W -Thrust &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; A,D-Rotate &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Z,X- Zoom in/Zoom out&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; V-Takeoff &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1-Reset Time-Warp')
	
}

let velRelativeToMoon = false
function draw(){
  background(imgSpace)
  timeSinceStart += timeScale*deltaTime/1000
	// if (event.which == KeyCode.KEY_Z) { 
	// console.log("Tab was pressed");
 //
  if (input_mem.includes(88)) {
		 // console.log("X!")
   //    console.log(cameraScale)
    if (cameraScale > .05) {
   		cameraScale = cameraScale/1.08
		}
	}
	if (input_mem.includes(65)) {
		// console.log("A!") 
		s5.rot -= 3.14/80 * (0.18*timeScale+0.816)
	}
	if (input_mem.includes(68)) {
		// console.log("D!")
		s5.rot += 3.14/80* (0.18*timeScale+0.816)
  }
	if (input_mem.includes(87)) {
		// console.log("W!")
		if (s5.vel.mag() < .2) {
			let moveVector2 = p5.Vector.fromAngle(PI-(s5.pos.angleBetween(earth.pos)+3*PI/4), earth.radius + 20)
			s5.pos.set(moveVector2)
		}
    // let thrustMagnitude = 100000000
    if (velRelativeToMoon){
      thrustMagnitude = 200000000
    }else{
      thrustMagnitude = 100000000
    }
		s5.applyForce(createVector(cos(PI/2 - s5.rot)*thrustMagnitude, -sin(PI/2 - s5.rot)*thrustMagnitude))}
	if (input_mem.includes(90)) {
		cameraScale = cameraScale*1.08
		// console.log(cameraScale)
  }
  if(input_mem.includes(49)){
    timeScale = 1
    document.querySelector("body > input[type=range]").value = "1"
  }
  if (input_mem.includes(86)){
    console.log("hi")
    if(s5.pos.dist(earth.pos) < s5.pos.dist(moon.pos)){
      console.log("earth")
      s5.pos.add(s5.pos.copy().sub(earth.pos).setMag(50))
    }
    else{
      console.log("moon")
      s5.pos.add(s5.pos.copy().sub(moon.pos).setMag(50))
    }
  }
  

	planetCollisions()
  let earthGravityMagnitude = (G* s5.mass * earth.mass) / (s5.pos.copy().dist(earth.pos.copy()))**2
  let earthGravtyDirection = s5.pos.copy().sub(earth.pos).heading()
  s5.applyForce(p5.Vector.fromAngle(earthGravtyDirection+Math.PI, earthGravityMagnitude))

  let moonGravityMagnitude = (G * s5.mass * moon.mass) / (s5.pos.copy().dist(moon.pos.copy()))**2
  let moonGravityDirection = s5.pos.copy().sub(moon.pos).heading()
  s5.applyForce(p5.Vector.fromAngle(-(PI-moonGravityDirection), moonGravityMagnitude))
  let moonAccVec = p5.Vector.fromAngle(-(PI-moonGravityDirection), moonGravityMagnitude)
  s5.update()

  // making the moon rotate along an ellipse
  const moonAngle = (timeSinceStart*PI)/6000
  // console.log(getMoonVelocity(moonAngle, PI/6000))
  moon.pos = createVector(384399*Math.cos(moonAngle)+4200, 383799*Math.sin(moonAngle))
  // moon.pos = createVector(128133*Math.cos(moonAngle)+1400, 127933*Math.sin(moonAngle))
  // moon.pos = createVector(42711*Math.cos(moonAngle)+467, 42644*Math.sin(moonAngle))
  cameraPos = s5.pos.copy()

  // drawing stuff
  push() //------------------------------------
  translate(width/2, height/2)
  scale(1/cameraScale)
  translate(-cameraPos.x, -cameraPos.y)
  
  fill(255, 255, 255, 50)
  ellipse(moon.pos.x, moon.pos.y, moon.radius*40)

  //DRAWING THE ATMOSPHERE----------------
  let atmosphere = drawingContext.createRadialGradient(
    0, 0, 5000, 
    0, 0, 5000*2
  )
  atmosphere.addColorStop(0, color(0, 0, 255, 255))
  atmosphere.addColorStop(1, color(0, 0, 0, 0))
  drawingContext.fillStyle = atmosphere
  ellipse(earth.pos.x, earth.pos.y, 6500*2+17)
  //--------------------------------------
  
  // earth.draw(color(255, 215, 0, 255), color(243, 113, 32, 255), color(61,54,53,255), color(65, 102, 245, 255))
  earth.draw(color(255, 215, 0, 255), color(243, 113, 32, 255), color(61,54,53,255), color(100, 100, 90, 255))
  moon.draw(color(243, 114, 33, 255), color(107, 107, 107, 255),color(107,107,107,255), color(107, 107, 107, 255))
  s5.draw(imgRocket)

  // drawing the trajectory
  let trajPoints = getTrajectoryPoints()
  fill(255, 0, 0)
  for (let i = 0; i < trajPoints.length; i++){
    push()
    if (i==0){
      translate(s5.pos.x, s5.pos.y)
      stroke(255)
      strokeWeight(2*cameraScale)
      line(0, 0, trajPoints[0].x-s5.pos.x, trajPoints[0].y-s5.pos.y)
    }
    else{
      translate(trajPoints[i].x, trajPoints[i].y)
      stroke(255)
      strokeWeight(2*cameraScale)
      line(0, 0, trajPoints[i-1].x-trajPoints[i].x, trajPoints[i-1].y-trajPoints[i].y)
    }
    noStroke()
    pop()
  }
  
  pop()//------------------------------------
  
  // reset the acceleration now, maybe this should be done better?
  s5.acc.mult(0)
  
  // let origin = createVector(1770, 930);
  let v
  if (velRelativeToMoon){
    v = s5.vel.copy().sub(getMoonVelocity(moonAngle, PI/6000)).setMag(100);
  }
  else{
    v = s5.vel.copy().setMag(100);
  }
  // let v = s5.vel.copy().sub(getMoonVelocity(moonAngle, PI/6000)).setMag(100);
  drawArrow(createVector(width/2, height/2), v, 'red');
  directionArrow (createVector(250,height-250), v, 'yellow');
  // drawArrow(createVector(width/2, height/2), moonAccVec.setMag(100), "blue")
  // fill(0, 255, 0)
  // ellipse(width/2, height/2, 20)

  function drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 30;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }
  
	function directionArrow(base, vec, myColor) {
		push();
		stroke(myColor);
		strokeWeight(3);
		fill(myColor);
		translate(base.x, base.y);
		rotate(s5.rot - PI/2)
		line(0, 0, 150, 0);
		let arrowSize = 30;
		triangle(150, arrowSize / 2, 150, -arrowSize / 2, arrowSize+150, 0);
		pop();
	}
  
  textSize(35);
  fill(255, 0, 0);
  if (velRelativeToMoon){
    text("Velocity of the Rocket: " + s5.vel.copy().sub(getMoonVelocity(moonAngle, PI/6000)).mag().toFixed(2) + " m/s", 100, 100);
  }else{
    text("Velocity of the Rocket: " + s5.vel.mag().toFixed(2) + " m/s", 100, 100);
  }

  fill(0, 255, 0)
  text("Warp Factor: " + timeScale + "x", width-550, 50)
	
  velRelativeToMoon = s5.pos.dist(moon.pos) < moon.radius*20
	if (endScreen === true){
		fill(0,0,0)
		rect(0,0, windowWidth, windowHeight)
		textSize(35);
		fill(255, 255, 255);
		text("You Schmoose!\n CLICK R TO RETRY", width/2, height/2)
		image(imgSad, 0, 200, 500, 300)
		
		if (input_mem.includes(82)) {
		  console.log("R")
			if (isReloading !== true){
				isReloading = true
				location.reload()
					
				 
			}
		}	
	}
}

function getTrajectoryPoints(){
  let output = []
  
  let posCopy = s5.pos.copy()
  let velCopy = s5.vel.copy()
  let accCopy = createVector(0,0)

  let trajectoryTimeInterval = 120 //in seconds
  for(let i = 0; i < 2000; i++){
    let earthGravityMagnitude = (G* s5.mass * earth.mass)/ (posCopy.dist(earth.pos.copy()))**2
    let earthGravityDirection = posCopy.copy().sub(earth.pos).heading()
    accCopy.add(p5.Vector.fromAngle(earthGravityDirection+Math.PI, earthGravityMagnitude).div(s5.mass))

    // making the moon rotate along an ellipse, taking into account the "time" of this sample point
    const thisMoonAngle = ((timeSinceStart+i*(trajectoryTimeInterval/100))*PI)/6000
    // const thisMoonPos = createVector(128133*Math.cos(thisMoonAngle)+1400, 127933*Math.sin(thisMoonAngle))
    const thisMoonPos = createVector(384399*Math.cos(thisMoonAngle)+4200, 383799*Math.sin(thisMoonAngle))
    
    let moonGravityMagnitude = (G* s5.mass * moon.mass)/ (posCopy.dist(thisMoonPos.copy()))**2
    let moonGravityDirection = posCopy.copy().sub(thisMoonPos).heading()
    accCopy.add(p5.Vector.fromAngle(-(PI-moonGravityDirection), moonGravityMagnitude).div(s5.mass))
    
    velCopy.add(accCopy.copy().mult(trajectoryTimeInterval/100))
    posCopy.add(velCopy.copy().mult(trajectoryTimeInterval/100))
    // console.log(Math.floor(deltaTime))
    accCopy.mult(0)

    if (posCopy.dist(earth.pos.copy()) < earth.radius-100 || posCopy.dist(moon.pos.copy()) < moon.radius-100){
      break
    }
    
    output.push(posCopy.copy())
  }
  return output
	
}

function getMoonVelocity(moonAngle, deltaTheta){
  return createVector(-128133*Math.sin(moonAngle)*deltaTheta, 127933*Math.cos(moonAngle)*deltaTheta)
}

/*
TODO:
  
*/