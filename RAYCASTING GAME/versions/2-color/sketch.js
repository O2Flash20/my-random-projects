let walls = [];
let ray;
let particle;

let textureTest;

function preload() {
    img = loadImage('assets/wood.png');
}

const sceneW = 400;
const sceneH = 400;

function setup() {
    createCanvas(800, 400);
    for (let i = 0; i < 5; i++) {
        let x1 = random(sceneW);
        let y1 = random(sceneH);
        let x2 = random(sceneW);
        let y2 = random(sceneH);
        walls[i] = new Boundary(x1, y1, x2, y2, color(random(255), random(255), random(255)));
    }
    walls.push(new Boundary(0, 0, sceneW, 0, color(200, 51, 7)));
    walls.push(new Boundary(sceneW, 0, sceneW, sceneH, color(200, 51, 7)));
    walls.push(new Boundary(sceneW, sceneH, 0, sceneH, color(200, 51, 7)));
    walls.push(new Boundary(0, sceneH, 0, 0, color(200, 51, 7)));

    particle = new Particle();
}

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

    fill(51, 51, 51);
    rectMode(CORNER);
    rect(sceneW, sceneH / 2, sceneW, sceneH / 2);
    fill(165, 222, 219);
    rectMode(CORNER);
    rect(sceneW, 0, sceneW, sceneH / 2);

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
        const wallColor = scene[i][1];
        const sq = scene[i][0] * scene[i][0];
        const wSq = sceneW * sceneW;
        const b = map(sq, 0, wSq, 1, 0);
        const h = (sceneW / scene[i][0]) * distProjPlane;
        fill(wallColor.levels[0] * b, wallColor.levels[1] * b, wallColor.levels[2] * b);
        // fill(wallColor.levels[0], wallColor.levels[1], wallColor.levels[2]);
        rectMode(CENTER);
        rect(i * w + w / 2, sceneH / 2, w + 1, h);
    }
    pop();

    noSmooth();
    image(img, 500, 10, 128, 128);
}