var songs = [
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FMinecraft%20OST%20-%20Pigstep.mp3?v=1622740979970",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FC418%20-%20Stal%20(Minecraft%20Volume%20Beta).mp3?v=1622740980455",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FBeginning.mp3?v=1622740984347",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FC418%20-%20Wait%20(Minecraft%20Volume%20Beta).mp3?v=1622740986311",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FMusic%20Disc%20-%2011%20(Minecraft%20C418).mp3?v=1622740988720",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FMoog%20City.mp3?v=1622740990759",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FDry%20Hands.mp3?v=1622740991041",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FClark.mp3?v=1622740994582",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FC418%20-%20Strad%20(Minecraft%20Volume%20Beta).mp3?v=1622740998141",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2F%C3%89quinoxe.mp3?v=1622740998295",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FC418%20-%20Mall%20(Minecraft%20Volume%20Beta).mp3?v=1622741000921",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FOxyg%C3%A8ne.mp3?v=1622741002177",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FHaggstrom.mp3?v=1622741004621",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FDoor.mp3?v=1622741009425",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FKey.mp3?v=1622741009932",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FLiving%20Mice.mp3?v=1622741009953",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FSweden.mp3?v=1622741016084",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FSubwoofer%20Lullaby.mp3?v=1622741016651",
  "https://cdn.glitch.com/a1a270d9-1b94-4153-9f65-7ca31dd8d876%2FMice%20On%20Venus.mp3?v=1622741018320",
]

var songNames= [
  "Pigstep",
  "Stal",
  "Beginning",
  "Wait",
  "11",
  "Moog City",
  "Dry Hands",
  "Clark",
  "Strad",
  "Equinoxe",
  "Mall",
  "Oxygene",
  "Haggstrom",
  "Door",
  "Key",
  "Living Mice",
  "Sweden",
  "Subwoofer Lullaby",
  "Mice on Venus"
]

let duration = 0;
let song = new Audio();
let audioPlay = false;
let autoToggle = false;


function songControl(command){
  if (command == "startButton"){
    autoToggle = true;
    songControl("start");
  }
  
  if (command == "start"){
    if (audioPlay == false){
        var chosenSong = Math.floor(Math.random() * songs.length);
      
        song.src = songs[chosenSong];
        song.volume = 0.2;
        song.play();
        
        document.getElementById("songPlaying").innerHTML = songNames[chosenSong];
    }
  }
  
  if (command == "stop"){
    song.pause();
    song.currentTime = 0;
    
    autoToggle = false;
    
    document.getElementById("songPlaying").innerHTML = "None";
    document.getElementById("totalTime").innerHTML = "0";
  }
}

setInterval(audioPlaying, 100)
function audioPlaying(){
  updateStats();
  
  if (song.currentTime !== 0 && !song.paused){
    audioPlay = true;
  }
  else{
    audioPlay = false;
  }
  
  if (audioPlay == false && autoToggle == true){
    songControl("start");
  }
}

function playSong(songName){
  autoToggle = false;
  
  song.src = songs[songNames.indexOf(songName)];
  song.play();
  
  document.getElementById("songPlaying").innerHTML = songName;
}


function updateStats(){
  document.getElementById("currentTime").innerHTML = String(Math.floor(Math.round(song.currentTime) / 60)) + ":" + String((Math.round(song.currentTime) % 60));
  
  if (!song.paused){
    document.getElementById("currentTime").innerHTML = String(Math.floor(Math.round(song.currentTime) / 60)) + ":" + String((Math.round(song.currentTime) % 60));
  }
  else{
    document.getElementById("currentTime").innerHTML = "0:0"
    document.getElementById("songPlaying").innerHTML = "None";
  }
  
  if (isNaN(song.duration)){
    document.getElementById("totalTime").innerHTML = "0:0"
  }
  else{
    if(audioPlay){
      document.getElementById("totalTime").innerHTML = String(Math.floor(Math.round(song.duration) / 60)) + ":" + String((Math.round(song.duration) % 60));
    }
    else{
      document.getElementById("totalTime").innerHTML = "0:0"
    }
  }
}
