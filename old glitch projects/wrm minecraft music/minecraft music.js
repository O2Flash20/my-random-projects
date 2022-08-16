//making it global
let autoplayEnabled = false;

let currentlyPlaying = " ";

let audioPlaying = false;
let audioPlayingOld = false;

let songVolume = 1;

var selectedSong = 0;

let hours = 0;
let minutes = 0;
let seconds = 0;

let songsShown = false

//detecting if any one of the audio elements is playing
setInterval(isAudioPlaying, 1);
function isAudioPlaying() {
  
  //getting all the elements
  var keyAudio = document.getElementById('key');
  var doorAudio = document.getElementById('door');
  var subwooferLullabyAudio = document.getElementById('subwooferLullaby');
  var livingMiceAudio = document.getElementById('livingMice');
  var moogCityAudio = document.getElementById('moogCity');
  var haggstromAudio = document.getElementById('haggstrom');
  var oxygeneAudio = document.getElementById('oxygene');
  var equinoxeAudio = document.getElementById('equinoxe');
  var miceOnVenusAudio = document.getElementById('miceOnVenus');
  var dryHandsAudio = document.getElementById('dryHands');
  var clarkAudio = document.getElementById('clark');
  var swedenAudio = document.getElementById('sweden');
  var beginningAudio = document.getElementById('beginning');
  
  //if at least one song is playing, set audioPlaying to true, else, set it to false
  if ((keyAudio.duration > 0 && !keyAudio.paused) || (doorAudio.duration > 0 && !doorAudio.paused) || (subwooferLullabyAudio.duration > 0 && !subwooferLullabyAudio.paused) || (livingMiceAudio.duration > 0 && !livingMiceAudio.paused) || (moogCityAudio.duration > 0 && !moogCityAudio.paused) || (haggstromAudio.duration > 0 && !haggstromAudio.paused) || (oxygeneAudio.duration > 0 && !oxygeneAudio.paused) || (equinoxeAudio.duration > 0 && !equinoxeAudio.paused) || (miceOnVenusAudio.duration > 0 && !miceOnVenusAudio.paused) || (dryHandsAudio.duration > 0 && !dryHandsAudio.paused) || (clarkAudio.duration > 0 && !clarkAudio.paused) || (swedenAudio.duration > 0 && !swedenAudio.paused) || (beginningAudio.duration > 0 && !beginningAudio.paused)) {
    audioPlaying = true;
  }
  else {
    audioPlaying = false;
  }
}


//updating the volume slider
setInterval(volumeSlider, 100);
function volumeSlider() {
  var sliderVolume = document.getElementById("volumeSlider");
  
  var volume1 = sliderVolume.value;
  
  var volume2 = (volume1 / 100);
  
  songVolume = volume2;
  
  if (audioPlaying == true){
    sliderVolume.classList.add("hidden");
  }
  else{
    sliderVolume.classList.remove("hidden");
  }
  
  //changing the volume display
  var volumeDisplay = document.getElementById("volumeDisplay");
  
  volumeDisplay.innerHTML = ("Volume: " + volume1 + "%");
}

//refresh song volume live
setInterval(volumeChange, 100);
function volumeChange(){
  selectedSong.volume = songVolume;
}

//defining playing all the songs
function playKey() {
  console.log('playing key')
  var selectedSong = document.getElementById("key");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Key - C418";
}

function playDoor() {
  console.log('playing door')
  var selectedSong = document.getElementById("door");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Door - C418";
}

function playSubwooferLullaby() {
  console.log('playing subwoofer lullaby')
  var selectedSong = document.getElementById("subwooferLullaby");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Subwoofer Lullaby - C418";
}

function playLivingMice() {
  console.log('playing living mice')
  var selectedSong = document.getElementById("livingMice");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Living Mice - C418";
}

function playMoogCity() {
  console.log('playing moog city')
  var selectedSong = document.getElementById("moogCity");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Moog City - C418";
}

function playHaggstrom() {
  console.log('playing haggstrom')
  var selectedSong = document.getElementById("haggstrom");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Haggstrom - C418";
}

function playOxygene() {
  console.log('playing oxygene')
  var selectedSong = document.getElementById("oxygene");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Oxygène - C418";
}

function playEquinoxe() {
  console.log('playing equinoxe')
  var selectedSong = document.getElementById("equinoxe");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Équinoxe - C418";
}

function playMiceOnVenus() {
  console.log('playing mice on venus')
  var selectedSong = document.getElementById("miceOnVenus");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Mice on Venus - C418";
}

function playDryHands() {
  console.log('playing dry hands')
  var selectedSong = document.getElementById("dryHands");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Dry Hands - C418";
}

function playClark() {
  console.log('playing clark')
  var selectedSong = document.getElementById("clark");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Clark - C418";
}

function playSweden() {
  console.log('playing sweden')
  var selectedSong = document.getElementById("sweden");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Sweden - C418";
}

function playBeginning() {
  console.log('playing beginning')
  var selectedSong = document.getElementById("beginning");
  selectedSong.play();
  selectedSong.volume = songVolume;
  currentlyPlaying = "Beginning - C418";
}

//playing an individual song but stopping all others before it (for the buttons on the site itself)
function playKeyButton() {
  stopAllSongs();
  playKey();
}

function playDoorButton() {
  stopAllSongs();
  playDoor();
}

function playSubwooferLullabyButton() {
  stopAllSongs();
  playSubwooferLullaby();
}

function playLivingMiceButton() {
  stopAllSongs();
  playLivingMice();
}

function playMoogCityButton() {
  stopAllSongs();
  playMoogCity();
}

function playHaggstromButton() {
  stopAllSongs();
  playHaggstrom();
}

function playOxygeneButton() {
  stopAllSongs();
  playOxygene();
}

function playEquinoxeButton() {
  stopAllSongs(); 
  playEquinoxe();
}

function playMiceOnVenusButton() {
  stopAllSongs();
  playMiceOnVenus();
}

function playDryHandsButton() {
  stopAllSongs();
  playDryHands();
}

function playClarkButton() {
  stopAllSongs();
  playClark();
}

function playSwedenButton() {
  stopAllSongs();
  playSweden();
}

function playBeginningButton() {
  stopAllSongs();
  playBeginning();
}

//defining stopping the songs
function stopKey() {
  var selectedSong = document.getElementById("key");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopDoor() {
  var selectedSong = document.getElementById("door");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopSubwooferLullaby() {
  var selectedSong = document.getElementById("subwooferLullaby");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopLivingMice() {
  var selectedSong = document.getElementById("livingMice");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopMoogCity() {
  var selectedSong = document.getElementById("moogCity");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopHaggstrom() {
  var selectedSong = document.getElementById("haggstrom");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopOxygene() {
  var selectedSong = document.getElementById("oxygene");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopEquinoxe() {
  var selectedSong = document.getElementById("equinoxe");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopMiceOnVenus() {
  var selectedSong = document.getElementById("miceOnVenus");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopDryHands() {
  var selectedSong = document.getElementById("dryHands");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopClark() {
  var selectedSong = document.getElementById("clark");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopSweden() {
  var selectedSong = document.getElementById("sweden");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

function stopBeginning() {
  var selectedSong = document.getElementById("beginning");
  selectedSong.pause();
  selectedSong.currentTime = 0;
}

//defining stopping all songs
function stopAllSongs() {
  console.log('stopping all')
  stopKey();
  stopDoor();
  stopSubwooferLullaby();
  stopLivingMice();
  stopMoogCity();
  stopHaggstrom();
  stopOxygene();
  stopEquinoxe();
  stopMiceOnVenus();
  stopDryHands();
  stopClark();
  stopSweden();
  stopBeginning();
}

//when the autoplay button is clicked
function startAutoplayButton() {
  autoplayEnabled = true;
  randomAutoplay();
}

//when the stop autoplay button is clicked
function stopAutoplayButton() {
  autoplayEnabled = false;
  stopAutoplay();
}

//the random autoplay feature
function randomAutoplay() {
  console.log('starting an autoplay')
  
  //saving the old selected song
  var oldSelectedSong = selectedSong
  
  //selecting random song
  var selectedSongDecimal = Math.random() * 13;
  var selectedSong = Math.floor(selectedSongDecimal);
  console.log(selectedSong);
  console.log(autoplayEnabled)
  
  //if the old selected song is the same as the new selected song, restart
  
  if (oldSelectedSong == selectedSong) {
    randomAutoplay();
  }
  
  else {
  
    //if autoplay is on
    if ((autoplayEnabled == true) && (audioPlaying == false)) {
    
      //play a song
      if (selectedSong == 0) {
        playKey();
        setTimeout(newRandomSong, 66000);
      }
    
      if (selectedSong == 1) {
        playDoor();
        setTimeout(newRandomSong, 113000);
      }  

      if (selectedSong == 2) {
        playSubwooferLullaby();
        setTimeout(newRandomSong, 210000);
      }
  
      if (selectedSong == 3) {
        playLivingMice();
        setTimeout(newRandomSong, 179000);
      }

      if (selectedSong == 4) {
        playMoogCity();
        setTimeout(newRandomSong, 161000);
      }

      if (selectedSong == 5) {
        playHaggstrom();
        setTimeout(newRandomSong, 205000);
      }

      if (selectedSong == 6) {
        playOxygene();
        setTimeout(newRandomSong, 67000);
      }

      if (selectedSong == 7) {
        playEquinoxe();
        setTimeout(newRandomSong, 116000);
      }

      if (selectedSong == 8) {
        playMiceOnVenus();
        setTimeout(newRandomSong, 281000);
      }
    
      if (selectedSong == 9) {
        playDryHands();
        setTimeout(newRandomSong, 70000);
      }

      if (selectedSong == 10) {
        playClark();
        setTimeout(newRandomSong, 193000);
      }

      if (selectedSong == 11) {
        playSweden();
        setTimeout(newRandomSong, 217000);
      }

      if (selectedSong == 12) {
        playBeginning();
        setTimeout(newRandomSong, 104000);
      }
    }
  }
}

//switching to a new random song
function newRandomSong() {
  randomAutoplay();
}

//stopping the autoplay
function stopAutoplay() {
  console.log('stopping all autoplay');
  stopAllSongs();
}

//swapping to the next random song in the autoplay
function nextAutoplay() {
  console.log('resetting autoplay')
  stopAutoplayButton();
  setTimeout(startAutoplayButton, 10);
}

//refreshing the "now playing"
setInterval(nowPlayingText, 100);

//display the current playing song
function nowPlayingText() {
  var nowPlayingElement = document.getElementById("playing");
  if (currentlyPlaying == " ") {
    nowPlayingElement.innerHTML = "Click a button above to play a song.";
  }
  else {
    if (audioPlaying == true){
      nowPlayingElement.innerHTML = ("Now playing " + currentlyPlaying);
    }
    else {
      if (autoplayEnabled == true) {
        nowPlayingElement.innerHTML = "New song loading...";
      }
      else {
        nowPlayingElement.innerHTML = "Click a button above to play a song.";
      }
    }
  }
}

//display the current time of the current song
setInterval(currentSongTime, 900);
function currentSongTime() {
  
  var currentTimeElement = document.getElementById("currentTime");
  
  if (audioPlaying == true){
    
      if (currentlyPlaying == "Key - C418") {
      var playingTimeElement = document.getElementById("key");
      var currentSongTotal = "1:05";
    }
      if (currentlyPlaying == "Door - C418"){
      var playingTimeElement = document.getElementById("door");
      var currentSongTotal = "1:52";
    }
    if (currentlyPlaying == "Subwoofer Lullaby - C418"){
      var playingTimeElement = document.getElementById("subwooferLullaby");
      var currentSongTotal = "3:29";
    }
    if (currentlyPlaying == "Living Mice - C418"){
      var playingTimeElement = document.getElementById("livingMice");
      var currentSongTotal = "2:58";
    }
    if (currentlyPlaying == "Moog City - C418"){
      var playingTimeElement = document.getElementById("moogCity");
      var currentSongTotal = "2:40";
    }
    if (currentlyPlaying == "Haggstrom - C418"){
      var playingTimeElement = document.getElementById("haggstrom");
      var currentSongTotal = "3:24";
    }
    if (currentlyPlaying == "Oxygène - C418"){
      var playingTimeElement = document.getElementById("oxygene");
      var currentSongTotal = "1:06";
    }
    if (currentlyPlaying == "Équinoxe - C418"){
      var playingTimeElement = document.getElementById("equinoxe");
      var currentSongTotal = "1:55";
    }
    if (currentlyPlaying == "Mice on Venus - C418"){
      var playingTimeElement = document.getElementById("miceOnVenus");
      var currentSongTotal = "4:42";
    }
    if (currentlyPlaying == "Dry Hands - C418"){
      var playingTimeElement = document.getElementById("dryHands");
      var currentSongTotal = "1:09";
    }
    if (currentlyPlaying == "Clark - C418"){
      var playingTimeElement = document.getElementById("clark");
      var currentSongTotal = "3:12";
    }
    if (currentlyPlaying == "Sweden - C418"){
      var playingTimeElement = document.getElementById("sweden");
      var currentSongTotal = "3:36";
    }
    if (currentlyPlaying == "Beginning - C418"){
      var playingTimeElement = document.getElementById("beginning");
      var currentSongTotal = "1:43";
    }
    var currentSongCurrentTime = Math.floor(playingTimeElement.currentTime);
  
    var currentSongCurrentTimeSeconds = currentSongCurrentTime % 60;
    var currentSongCurrentTimeMinutes = Math.floor(currentSongCurrentTime / 60);
    
    var currentSongCurrentTimeFull = (currentSongCurrentTimeMinutes + ":" + currentSongCurrentTimeSeconds);
    var currentSongCurrentTimeFull2 = (currentSongCurrentTimeFull + " / " + currentSongTotal)
   
    currentTimeElement.innerHTML = currentSongCurrentTimeFull2;
  }
  
  else {
    currentTimeElement.innerHTML = "No song currently playing.";
  }
}

//setting the clock reset to repeat
setInterval(resetClock, 100);

//clock

function resetClock(){
  var clockTime = new Date();
  hours = clockTime.getHours();
  minutes = clockTime.getMinutes();
  seconds = clockTime.getSeconds();

 // var clockDisplay = String("The time is: " + hours + ":" + minutes + ':' + seconds);
//  var clockDisplayElement = document.getElementById("clock")
 // clockDisplayElement.innerHTML = clockDisplay;
}

//setting the arms of the round clock
setInterval(resetRoundClock, 10);
function resetRoundClock() {
  //get the 360 angle of the hour hand
  if (hours > 12){
    hours = hours - 12
  }
  var hoursAngle = (hours * 360) / 12;
  
  //get the 360 angle of the minute hand
  var minutesAngle = (minutes * 360) / 60;
  
  
  //get the 360 angle of the second hand
  var secondsAngle = (seconds * 360) / 60;
  
  //set all the clock hands to the right rotation
  
  //hours
  document.getElementById("hourHand").style.transform = ("rotate" + "(" + hoursAngle + "deg" + ")")
  
  //minutes
  document.getElementById("minuteHand").style.transform = ("rotate" + "(" + minutesAngle + "deg" + ")")
  
  //seconds
  document.getElementById("secondHand").style.transform = ("rotate" + "(" + secondsAngle + "deg" + ")")
}

//when the "audioPlaying" variable changes
setInterval(jukeDicsCheck, 2000);
function jukeDicsCheck(){
  if(audioPlayingOld !== audioPlaying){
    jukeDics();
  }
  audioPlayingOld = audioPlaying;
}

//display the animation of the disc and the jukebox
function jukeDics(){
  if (audioPlaying == true){
    document.getElementById("jukeDics").src = "https://cdn.glitch.com/41f71cf5-cf89-4508-a91f-4f06e97989e1%2Fjukedics.gif?v=1612368221524";
  }
  else {
    document.getElementById("jukeDics").src = "https://cdn.glitch.com/41f71cf5-cf89-4508-a91f-4f06e97989e1%2Fjukedics%202.gif?v=1612368218629";
  }
}  

//the animation for when you click the jukebox to display the buttons
function clickJukebox(){
  document.getElementById("jukeDics").classList.remove("shek")
  if (songsShown == false){
    document.getElementById("songList").classList.remove("hidden");
    document.getElementById("songList").classList.remove("slide-in-elliptic-top-bwd");
    document.getElementById("songList").classList.add("slide-in-elliptic-top-fwd");
    songsShown = true;
  }
  else{
    document.getElementById("songList").classList.remove("slide-in-elliptic-top-fwd");
    document.getElementById("songList").classList.add("slide-in-elliptic-top-bwd");
    setTimeout(hideSongList, 700);
    songsShown = false;
  }
}

function hideSongList(){
  document.getElementById("songList").classList.add("hidden");
}




//animaiton stuff


//hiding all the animations
function hideAllAnimations() {
  var a1Element = document.getElementById("a1");
  a1Element.classList.add("hidden");
  
  var a2Element = document.getElementById("a2");
  a2Element.classList.add("hidden");
  
  var a3Element = document.getElementById("a3");
  a3Element.classList.add("hidden");
  
  var a4Element = document.getElementById("a4");
  a4Element.classList.add("hidden");
}

//hiding all the animations then unhiding animation 1
function playAnimation1() {
  hideAllAnimations();
  var a1Element = document.getElementById("a1");
  a1Element.classList.remove("hidden");
}

//hiding all the animations then unhiding animation 2
function playAnimation2() {
  hideAllAnimations();
  var a2Element = document.getElementById("a2");
  a2Element.classList.remove("hidden");
}

//hiding all the animations then unhiding animation 3
function playAnimation3() {
  hideAllAnimations();
  var a3Element = document.getElementById("a3");
  a3Element.classList.remove("hidden");
}

function playAnimation4() {
  hideAllAnimations();
  var a4Element = document.getElementById("a4");
  a4Element.classList.remove("hidden");
}

//playing a random animation
function randomAnimation(){
  var selectedSong = Math.floor((Math.random()*4) + 1)
  console.log(selectedSong)
}

//showing the animaiton UI
function animationsAppear(){
  document.getElementById("animationsContainerContainer").classList.remove("hidden");
}

//hiding the animaiton UI
function animationsDisappear(){
  document.getElementById("animationsContainerContainer").classList.add("hidden");
}