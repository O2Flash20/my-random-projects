let flock = []

function setup() {
  createCanvas(600, 400);

  for(let i=0;i<50;i++){
    flock.push(new Boid(createVector(random(width), random(height)), p5.Vector.random2D()))
  }
}

function draw() {
  background(220);

  for (let boid of flock){
    // boid.align(flock, 50)
    boid.cohesion(flock, 50)
    boid.update()
    boid.show()
  }
}
