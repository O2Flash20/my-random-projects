let tentacle

function setup() {
  createCanvas(600, 400)

  let t = 0

  tentacle = new Segment(null, width / 2, height, 10, radians(0), t)

  let current = tentacle
  for (let i = 0; i < 20; i++) {
    t += 0.1
    let next = new Segment(current, null, null, 10, 0, t)
    current.child = next
    current = next
  }
}

function draw() {
  background(51)

  let next = tentacle
  while (next) {
    next.wiggle()
    next.update()
    next.show()
    next = next.child
  }

  tentacle.wiggle()
  tentacle.update()
  tentacle.show()
}
