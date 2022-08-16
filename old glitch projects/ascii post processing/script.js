let fontSize = (10)

let v = document.getElementById("inputVideo")

let c = document.getElementById("inputCanvas")
let ctx = c.getContext("2d")

let c1 = document.getElementById("outputCanvas")
let ctx1 = c1.getContext("2d")

let c2 = document.getElementById("outputCanvas1")
let ctx2 = c2.getContext("2d")

let ascii = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^'.    `

// map a range to a new range
function map(value, min1, max1, min2, max2){
  return (value-min1) * ((max2-min2)/(max1-min1)) + min2
}
function brightnessToAscii(brightness){
  return ascii.charAt(Math.floor(map(brightness, 255, 0, 0, ascii.length)))
}


var constraints = {audio: false, video: true}
navigator.mediaDevices.getDisplayMedia(constraints)
.then(function(mediaStream) {
  v.srcObject = mediaStream;
  v.onloadedmetadata = function(e) {
    v.play();
    ctx.scale(1920/v.videoWidth, 1080/v.videoHeight)
  };
})
.catch(function(err) { console.log(err.name + ": " + err.message); })

c.width = 1920
c.height = 1080

c1.width = c.width/fontSize
c1.height = c.height/fontSize
ctx1.scale(c1.width/c.width, c1.height/c.height)

c2.width = c.width
c2.height = c.height
ctx2.font = `${fontSize}px monospace`

let ctx1Raw

setInterval(function(){
  ctx.drawImage(v, 0, 0)
  ctx1.drawImage(c, 0, 0)
  
  ctx2.fillStyle = "black"
  ctx2.fillRect(0, 0, c2.width, c2.height)
  
  ctx1Raw = ctx1.getImageData(0, 0, c1.width, c1.height).data
  
  ctx2.fillStyle="white"
  for(let i = 0; i < ctx1Raw.length; i+=4){
    let brightness = (ctx1Raw[i]+ctx1Raw[i+1]+ctx1Raw[i+2])/3
    ctx2.fillStyle=`rgba(${ctx1Raw[i]*2}, ${ctx1Raw[i+1]*2}, ${ctx1Raw[i+2]*2}, 255)`
    ctx2.fillText(brightnessToAscii(brightness), (i/4)%c1.width*fontSize, Math.floor((i/4)/c1.width)*fontSize)
  }
},16)