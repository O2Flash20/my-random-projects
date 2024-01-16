// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint

const circlesX = 40
const circlesY = 8
const circlesR = 800 / (2 * circlesX)

// create an engine
var engine = Engine.create()
engine.positionIterations = 10
engine.velocityIterations = 1

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
})

let objects = [
    Bodies.rectangle(400, 610, 810, 60, { isStatic: true }),
    Bodies.rectangle(-10, 300, 10, 600, { isStatic: true }),
    Bodies.rectangle(810, 300, 10, 600, { isStatic: true }),
    Bodies.rectangle(400, -10, 810, 10, { isStatic: true }),
]

for (let i = 0; i < circlesX; i++) {
    for (let j = 0; j < circlesY; j++) {
        objects.push(
            Bodies.circle(
                i * ((800 - 4 * circlesR) / circlesX) + 2 * circlesR,
                j * 2 * circlesR,
                circlesR,
                { restitution: 0.7, friction: 0 }
            )
        )
    }
}

Composite.add(engine.world, objects)

// Create a mouse constraint
const mouse = Mouse.create(render.canvas)
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2, // Adjust stiffness as needed
    },
})

// Add the mouse constraint to the world
Composite.add(engine.world, mouseConstraint)

// Handle mouse movement to apply force to nearby bodies
document.addEventListener('mousemove', (event) => {
    const mousePosition = mouse.position

    Composite.allBodies(engine.world).forEach((body) => {
        const distance = Matter.Vector.magnitude(Matter.Vector.sub(body.position, mousePosition))

        // Define a threshold distance, adjust as needed
        const thresholdDistance = 50

        if (distance < thresholdDistance) {
            // const force = Matter.Vector.sub(mousePosition, body.position)
            const force = Matter.Vector.sub(body.position, mousePosition)
            const magnitude = Matter.Vector.magnitude(force)

            if (magnitude !== 0) {
                // Normalize the force vector
                force.x /= magnitude
                force.y /= magnitude

                // Scale the force and apply it to the body
                Matter.Body.applyForce(body, body.position, {
                    x: force.x * 0.005, // Adjust force strength as needed
                    y: force.y * 0.005,
                })
            }
        }
    })
})

Render.run(render)

var runner = Runner.create()
runner.delta = 1000 / 60

Runner.run(runner, engine)


let fluidShader
function preload() {
    fluidShader = loadShader("basic.vert", "fluid.frag")
}

function setup() {
    createCanvas(800, 600, WEBGL)
}

function draw() {
    let posArray = []
    for (let i = 3; i < objects.length; i++) {
        posArray.push(objects[i].position.x)
        posArray.push(objects[i].position.y)
    }

    fluidShader.setUniform("uPos", posArray)
    fluidShader.setUniform("uRes", [width, height])
    shader(fluidShader)
    rect(0, 0, width, height)
}