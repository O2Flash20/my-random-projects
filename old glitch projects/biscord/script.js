//encoding and decoding a message to numbers
let chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", ",", ".", ":", "!", "?", "/", "<", ">", "'", "(", ")", "{", "}", ";", "=", '"']

//key presses
document.addEventListener('keydown', logKey);
function logKey(e) {
  if (e.code == "Backslash"){
    eval(prompt("do your hacking stuff -- Console:"))
  }
}

function encode(input){
  let output = "";
  for (let i = 0; i < input.length; i++){
    var currentEncode = chars.indexOf(input.charAt(i));
    if (String(currentEncode).length < 2){
      currentEncode = "0" + currentEncode;
    }
    output += currentEncode;
  }
  return output
}

function decode(input){
  let output = "";
  for (let i = 0; i < input.length; i += 2){
    var charInput = (input.charAt(i) + input.charAt(i+1))
    output += chars[parseInt(charInput)]
  }
  return output
}

//setting username
let username = decode(String(Math.floor(Math.random() * 50)))
function usernameApply(){
  onlineList.splice(onlineList.indexOf(username), 1)
  send(username + " Has changed their username to: " + document.getElementById("usernameInput").value)
  username = document.getElementById("usernameInput").value
}

//join message
send("Someone has joined the chat!")

//send an automatic message
function send(message){
  cloud_newMessage = encode(message)
}

//sending a message
var cloud_newMessage
function sendMessage(){
  var message = document.getElementById("sendInput").value;
  document.getElementById("sendInput").value = null
  cloud_newMessage = encode(username + ": " + message);
}

//writing out messages
let lastMessage = ""
setInterval(recieveMessage, 100)
function recieveMessage(){
  if (cloud_newMessage !== 0 && cloud_newMessage !== lastMessage){    
    let el = document.createElement("p");
    el.innerHTML = decode(cloud_newMessage)
    document.body.appendChild(el)
  }
  lastMessage = cloud_newMessage
}

//online list
var cloud_onlineList
let onlineList = []
function sendNameToList(){
  if (!onlineList.inludes(username)){    
   // cloud_onlineList += encode(username) + "99"
  }
}

//decode online list
function updateOnline(){
  for (let i = 0; i < cloud_onlineList.length; i++){
    if(cloud_onlineList.charAt(i) == "9" && cloud_onlineList.charAt(i+1) == "9" && i % 2 == 0){
      //next username
    }
  }
}

//random check to remove exited users
setInterval(removeAllOnline, 10000)

function removeAllOnline(){
  onlineList = []
  sendNameToList()
}

//update user list 
setInterval(function updateUserList(){
  document.getElementById("userList").innerHTML = onlineList
}, 1000) 

//for all hacking needs 
var cloud_eval
function hack(command){
  cloud_eval = encode(command)
}
let lastEval
lastEval = cloud_eval  //make work
setInterval(recieveHack, 100)
function recieveHack(){
  if(cloud_eval !== lastEval){
    eval(decode(cloud_eval))
  }
  lastEval = cloud_eval
}

function createElement(type, innerHTML, id, classe, container, style, inputType){
  const el = document.createElement(type)
  el.innerHTML = innerHTML
  el.id = id
  el.classList.add(classe)
  el.style = style
  el.type = inputType
  document.getElementById(container).appendChild(el)
}

//diplaying an image
function display(width, height, imageArray){
  for (let i = 0; i < height; i++){
    createElement("div", null, "imageLayer" + i, null, "image")
    for (let e = 0; e < width; e++){
      if(imageArray[width*i+e] == 0){
        createElement("span", null, `image${i},${e}`, "black", "imageLayer" + i, "width:" + 10 + "px;height:" + 10 + "px;")
      }
      else{
        createElement("span", null, `image${i},${e}`, "white", "imageLayer" + i, "width:" + 10 + "px;height:" + 10 + "px;")
      }
    }
  }
}

//image maker
function openImageUI(){
  document.getElementById("createImageUI").style.visibility = "visible"
}
let imgWidth
let imgHeight
function createImageMaker(){
  imgWidth = document.getElementById("width").value
  imgHeight = document.getElementById("height").value
  
  let buttonNumber = 0
  for (let i = 0; i < imgHeight; i++){
    createElement("div", null, "createImageLayer" + i, null, "imageMaker")
    for (let e = 0; e < imgWidth; e++){
      createElement("input", null, `createImage${buttonNumber}`, null, "createImageLayer" + i, null, "checkbox")
      buttonNumber++
    }
  }
}

//sending image
function imageFromMaker(){
  let savedImage = []
  for (let i = 0; i < imgWidth*imgHeight; i++){
    if(document.getElementById("createImage"+i).checked == true){
      savedImage.push(1)
    }
    else{
      savedImage.push(0)
    }
  }
  return savedImage
}