// ml5.js: Pose Estimation with PoseNet
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/7.1-posenet.html
// https://youtu.be/OIo-DIOkNVg
// https://editor.p5js.org/codingtrain/sketches/ULA97pJXR

let video;
let poseNet;
let pose;
let skeleton;

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    pointsRaw = {
        rightEye: [],
        leftEye: [],
        rightEar: [],
        leftEar: [],
        rightShoulder: [],
        leftShoulder: [],
        rightWrist: [],
        leftWrist: []
    }
    pointsSmoothed = {
        rightEye: [],
        leftEye: [],
        rightEar: [],
        leftEar: [],
        rightShoulder: [],
        leftShoulder: [],
        rightWrist: [],
        leftWrist: []
    }
    emitter = new Emitter(createVector(320, 240), createVector(random(-1, 1), random(-1, 1)), 0.5, 500, "wrap")
    faceVel = createVector(0, 0)
    facePos = []

    noStroke()
}
let emitter
let faceVel
let facePos
const velAvg = 15

function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelLoaded() {
    console.log('poseNet ready');
}

let pointsRaw
let pointsSmoothed
let smoothAmount = 12

// FACE: 275x275
// BODY: 420x175
// BACKGROUND: 640x480
const presets = {
    flash:{
        face: "face.png",
        body: "body.png",
        background: "background.png",
        color: "cyan"
    },
    katanablade:{
        face: "face1.png",
        body: "body1.png",
        background: "background1.png",
        color: "OrangeRed"
    }
}
const presetChosen = presets.flash

function preload(){
    faceImg = loadImage(presetChosen.face)
    bodyImg = loadImage(presetChosen.body)
    backgroundImg = loadImage(presetChosen.background)
}
function draw() {
    // image(video, 0, 0);
    image(backgroundImg, 0, 0, width, height)

    emitter.emit(createVector(random(-5, 5), random(-5, 5)), "bounce", 0.3, "ellipse", presetChosen.color)
    emitter.update()
    emitter.draw(10, 10)

    if (pose) {

        pointsRaw.rightEye.push([pose.rightEye.x, pose.rightEye.y])
        pointsRaw.leftEye.push([pose.leftEye.x, pose.leftEye.y])
        pointsRaw.rightEar.push([pose.rightEar.x, pose.rightEar.y])
        pointsRaw.leftEar.push([pose.leftEar.x, pose.leftEar.y])
        pointsRaw.rightShoulder.push([pose.rightShoulder.x, pose.rightShoulder.y])
        pointsRaw.leftShoulder.push([pose.leftShoulder.x, pose.leftShoulder.y])
        pointsRaw.rightWrist.push([pose.rightWrist.x, pose.rightWrist.y])
        pointsRaw.leftWrist.push([pose.leftWrist.x, pose.leftWrist.y])


        for (part of Object.keys(pointsRaw)) {
            let point = pointsRaw[part]
            while (point.length > smoothAmount){
                point.splice(0, 1)
            }

            let xAvg = 0
            let yAvg = 0
            for (let i = 0; i < point.length; i++) { 
                xAvg+= point[i][0]
                yAvg+= point[i][1]
            }
            xAvg /= point.length
            yAvg /= point.length

            pointsSmoothed[part] = [xAvg, yAvg]
        }

        for (part of Object.keys(pointsRaw)) {
            ellipse(pointsSmoothed[part][0], pointsSmoothed[part][1], 5, 5)
        }

        drawBody()
        drawFace()
    }

    facePos.push(createVector((pointsSmoothed.rightEye[0] + pointsSmoothed.leftEye[0])/2, (pointsSmoothed.rightEye[1] + pointsSmoothed.leftEye[1])/2-20))
    while(facePos.length > velAvg){
        facePos.splice(0, 1)
    }
    faceVel = facePos[0].copy().sub(facePos[velAvg-1]).mult(-1/velAvg)
    if (facePos[velAvg-1]){
        for (particle of emitter.particles){
            if (dist(particle.pos.x, particle.pos.y, facePos[velAvg-1].x, facePos[velAvg-1].y) < 140){
                particle.applyForce(faceVel)
            }
        }
    }
}

function drawFace() {
    push()
    const dx = pointsSmoothed.rightEye[0] - pointsSmoothed.leftEye[0]
    const dy = pointsSmoothed.rightEye[1] - pointsSmoothed.leftEye[1]
    const theta = atan(dy/dx)
    imageMode(CENTER)
    angleMode(DEGREES)
    translate((pointsSmoothed.rightEye[0] + pointsSmoothed.leftEye[0])/2, (pointsSmoothed.rightEye[1] + pointsSmoothed.leftEye[1])/2-20)
    rotate(theta)
    image(faceImg, 0, 0)
    pop()
}

function drawBody(){
    push()
    const dx = pointsSmoothed.rightShoulder[0] - pointsSmoothed.leftShoulder[0]
    const dy = pointsSmoothed.rightShoulder[1] - pointsSmoothed.leftShoulder[1]
    const theta = atan(dy/dx)
    imageMode(CENTER)
    angleMode(DEGREES)
    translate((pointsSmoothed.rightShoulder[0] + pointsSmoothed.leftShoulder[0])/2, (pointsSmoothed.rightShoulder[1] + pointsSmoothed.leftShoulder[1])/2+10)
    rotate(theta)
    image(bodyImg, 0, 0)
    pop()
}