let streak = 0;
function streakUp(){
  streak++;
  document.getElementById("streakCounter").innerHTML = streak
  buttonNoise();
}

var sound = new Audio("https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FMinecraft%20Button%20Sound%20Effects.mp3?v=1622767458308");

function streakReset(){
  var streakResetVar = setInterval(function streakTo0(){
    if (streak !== 0){
      streak--;
      document.getElementById("streakCounter").innerHTML = streak;
      buttonNoise()
    }
    else{
      clearInterval(streakResetVar);
    }
  }, 100)
}

function buttonNoise(){
  sound.currentTime = 0;
  sound.play();
}