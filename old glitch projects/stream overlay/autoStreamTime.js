let secondsSinceEpochStart = 0;
var secondsSinceEpochNow = 0;

let onToggle = false;

function streamStart(){
  onToggle = true;
  
  secondsSinceEpochStart = Math.round(Date.now() / 1000);
}

function streamStop(){
  onToggle = false;
}

setInterval(timer, 1000)

function timer(){
  if (onToggle == true){
    var secondsSinceEpochNow = Math.round(Date.now() / 1000);
    
    var timeStreamingSec = (secondsSinceEpochNow - secondsSinceEpochStart);
    
    var timeStreamingSec1 = timeStreamingSec % 60;
    
    var timeStreamingMin = Math.floor(timeStreamingSec / 60);
    
    var timeStreamingMin1 = Math.floor(timeStreamingMin % 60);
    
    var timeStreamingHr = Math.floor(timeStreamingMin / 60);
    
    document.getElementById("timeSec").innerHTML = timeStreamingSec1;
    document.getElementById("timeMin").innerHTML = timeStreamingMin1;
    document.getElementById("timeHr").innerHTML = timeStreamingHr;
  }
}

streamStart()