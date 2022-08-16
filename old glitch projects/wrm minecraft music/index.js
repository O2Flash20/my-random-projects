function mouseOnStart(){
  document.getElementById("startButton").src = "https://cdn.glitch.com/41f71cf5-cf89-4508-a91f-4f06e97989e1%2Fstart%204%20good.gif?v=1612361292403";
}

function mouseOffStart(){
  document.getElementById("startButton").src = "https://cdn.glitch.com/41f71cf5-cf89-4508-a91f-4f06e97989e1%2Fstart%204%20back%20good.gif?v=1612361294898";
}

function clickStart(){
  document.getElementById("indexLinks").classList.add("slide-in-blurred-top")
  document.getElementById("indexLinks").classList.remove("hidden")
  document.getElementById("startButton").classList.remove("shek")
}
