let walls = [];
let ray;
let particle;
let xoff = 0;
let yoff = 10000;

const sceneW = 400;
const sceneH = 400;
// let sliderFOV;

function setup() {
    createCanvas(800, 400);
    for (let i = 0; i < 5; i++) {
        let x1 = random(sceneW);
        let y1 = random(sceneH);
        let x2 = random(sceneW);
        let y2 = random(sceneH);
        walls[i] = new Boundary(x1, y1, x2, y2);
    }
    walls.push(new Boundary(0, 0, sceneW, 0));
    walls.push(new Boundary(sceneW, 0, sceneW, sceneH));
    walls.push(new Boundary(sceneW, sceneH, 0, sceneH));
    walls.push(new Boundary(0, sceneH, 0, 0));

    particle = new Particle();

    // sliderFOV = createSlider(0, 360, 45);
    // sliderFOV.input(changeFOV);
}

// function changeFOV() {
//     const fov = sliderFOV.value();
//     particle.updateFOV(fov);
// }

function draw() {
    if (keyIsDown(65)) {
        particle.rotate(-0.05);
    } else if (keyIsDown(68)) {
        particle.rotate(0.05);
    }
    if (keyIsDown(87)) {
        particle.move(1);
    }
    if (keyIsDown(83)) {
        particle.move(-1);
    }

    background(0);
    for (let wall of walls) {
        wall.show();
    }
    particle.show();

    distProjPlane = sceneW / 2.0 / tan(particle.fov / 2.0);
    const scene = particle.look(walls);
    const w = sceneW / scene.length;

    push();
    translate(sceneW, 0);
    for (let i = 0; i < scene.length; i++) {
        noStroke();
        const sq = scene[i] * scene[i];
        const wSq = sceneW * sceneW;
        const b = map(sq, 0, wSq, 255, 0);
        const h = (sceneW / scene[i]) * distProjPlane;
        fill(b);
        rectMode(CENTER);
        rect(i * w + w / 2, sceneH / 2, w + 1, h);
    }
    pop();


    // ray.show();
    // ray.lookAt(mouseX, mouseY);

    // let pt = ray.cast(wall);
    // if (pt) {
    //     fill(255);
    //     ellipse(pt.x, pt.y, 8, 8);
    // }
    // console.log(pt);
}
