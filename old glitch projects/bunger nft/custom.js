//maybe changed values
const width = 100

function ranInt(min, max){
  return Math.round(Math.random()*(max-min))+min
}

let c = document.getElementById("bungerDisplay")
let ctx = c.getContext("2d")
c.width = width
c.height = width
ctx.imageSmoothingEnabled = false

let c1 = document.getElementById("scaledUp")
let ctx1 = c1.getContext("2d")
c1.width = width*10
c1.height = width*10
ctx1.imageSmoothingEnabled = false
ctx1.scale(10, 10)

function drawBunger(){
  ctx.beginPath()
  ctx.rect(10, 10, 5, 15)
  ctx.fillStyle = "red"
  
  ctx.filter = "hue-rotate(" + ranInt(0, 359) + "deg)"
  
  ctx.fill()
}

let image

function drawPiece(src, hueRotation, y){
  image = new Image()
  image.src = src
  image.crossOrigin="anonymous"
  ctx.filter = `hue-rotate(${hueRotation}deg)`
  ctx.drawImage(image, width/2 - image.width/2, y, image.width, image.height)
}

function stack(repeats, radius){
  ctx.beginPath()
  ctx.rect(0, 0, width, width)
  ctx.fillStyle = "#363636"
  ctx.fill()
  
  for(let i = 0; i < repeats; i++){
    drawPiece("https://cdn.glitch.me/1b580bdb-7357-4a93-a08b-b4a9e47e0714/test1.png?v=1639604517476", i*100, (width/2+radius)-50-i*(2*radius)/(repeats-1))
  }
}

let slider = document.getElementById("spacingSlider")
let slider2 = document.getElementById("repeatsSlider")

slider.oninput = function() {
  stack(parseFloat(slider2.value), parseFloat(slider.value))
}
slider2.oninput = function() {
  stack(parseFloat(slider2.value), parseFloat(slider.value))
}

let saveButton = document.getElementById("saveButton")

saveButton.addEventListener('click', function(e) {
  ctx1.drawImage(c, 0, 0)
  const link = document.createElement('a');
  link.download = 'your bunger.png';
  link.href = c1.toDataURL();
  link.click();
  link.delete;
});

stack(parseFloat(slider2.value), parseFloat(slider.value))

function closeBunger(){
  var loop = setInterval(function e(){
    if (slider.value != 2*slider2.value){
      if(slider.value > 2*slider2.value){
        slider.value -= 1
      }else{
        slider.value += 1
      }
      stack(parseFloat(slider2.value), parseFloat(slider.value))
    }else{
      clearInterval(loop)
    }
  }, 16)
}