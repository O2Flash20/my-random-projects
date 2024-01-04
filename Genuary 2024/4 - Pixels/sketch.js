let particles = []
class Particle{
  constructor(pos, vel){
    this.pos = pos
    this.vel = vel
    this.kill = false
  }
  
  update(){
    this.pos.add(this.vel)
    const x = clamp(Math.floor(this.pos.x), 0, c.width-1)
    const y = clamp(Math.floor(this.pos.y), 0, c.height-1)
    if(x >= c.width-1 || x <= 0 || y <= 0 || y >= c.height-1 ||
        (worldGrid[x+1][y]==1 && this.vel.x > 0) || (worldGrid[x-1][y]==1 && this.vel.x < 0) || (worldGrid[x][y+1]==1 && this.vel.y > 0) || (worldGrid[x][y-1]==1 && this.vel.y < 0)
      ){
      worldGrid[x][y] = 1
      this.kill = true
    }
  }

  draw(){
    c.fill(255, 255, 0)
    c.rect(Math.floor(this.pos.x), Math.floor(this.pos.y), 1, 1)
  }
}

let worldGrid = []

let c // "pixel canvas"
let playerPos
function setup() {
  createCanvas(1000, 500)
  noSmooth()
  c = createGraphics(100, 50)
  c.noSmooth()
  c.noStroke()

  playerPos = createVector(c.width/2, c.height/2)

  worldGrid = [...Array(c.width)].map(e => Array(c.height).fill(0))
}

function draw() {
  c.background(51)
  c.fill(100, 150, 255)
  c.rect(Math.floor(playerPos.x), Math.floor(playerPos.y), 2, 4)

  // controlling the player
  if (keyIsDown(65) && playerPos.x > 0){
    playerPos.add(createVector(-0.5, 0))
  }
  if (keyIsDown(83)&& playerPos.y < c.height-4){
    playerPos.add(createVector(0, 0.5))
  }
  if (keyIsDown(87)&& playerPos.y > 0){
    playerPos.add(createVector(0, -0.5))
  }
  if (keyIsDown(68)&& playerPos.x < c.width-2){
    playerPos.add(createVector(0.5, 0))
  }

  for (let i = 0; i < particles.length; i++){
    particles[i].update()
    particles[i].draw()
  }

  // remove particles that need to be removed
  for(let i = particles.length - 1; i >= 0; i--){
    if(particles[i].kill==true){
      particles.splice(i, 1)
    }
  }

  c.fill(255, 255, 0)
  for (let i =0; i < worldGrid.length; i++){
    for(let j = 0; j < worldGrid[0].length; j++){
      if(worldGrid[i][j]==1){
        c.rect(i, j, 1, 1)
      }
    }
  }

  c.fill(255, 0, 0)
  c.rect(Math.floor(mouseX*(c.width/width)), Math.floor(mouseY*(c.height/height)), 1, 1)

  image(c, 0, 0, width, height)
}

function keyPressed(){
  if (keyCode == 69){
    const mousePixel = createVector(mouseX*(c.width/width), mouseY*(c.height/height))
    for (let i =0; i < worldGrid.length; i++){
      for(let j = 0; j < worldGrid[0].length; j++){
        if(worldGrid[i][j]==1 && (mousePixel.x-i)**2+(mousePixel.y-j)**2 < 100){
          worldGrid[i][j] = 0
          particles.push(new Particle(createVector(i, j), createVector(i, j).sub(mousePixel.copy()).div(10).add(createVector(random(-0.6, 0.6), random(-0.6, 0.6)))))
        }
      }
    }
  }

  if (keyCode == 32){
    let mouseDir = createVector(mouseX*(c.width/width), mouseY*(c.height/height)).sub(playerPos).setMag(0.9)
    for(let i = 0; i < 10; i++){
      particles.push(new Particle(playerPos.copy().add(1, 2), mouseDir.copy().add(createVector(random(-0.1, 0.1), random(-0.1, 0.1)))))
    }
  }
}

function clamp(v, min, max){
  return Math.min(Math.max(v, min), max)
}