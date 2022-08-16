var blockH;

var loopSchoolDay = 3;

var timeDisplay = document.getElementById("time");
var timeUntilNextClass = document.getElementById("timeUntilNextClass");

checkPassword()

function checkPassword(){
  var answer = prompt("enter password (the class number)", "222")
  if (answer == 222){
    alert("you idiot")
  }
  if (answer == 438){
    
  }
  else {
    location.replace("./stuck.html")
  }
}


function virus() {
  alert("Download Virus?");
}

function hamburger() {
  var hamburgerElement = document.getElementById("hamburger");
  hamburgerElement.play();
}

//definning playing the alarm sound before a class starts

function playAlarm() {
  var alarmElement = document.getElementById("alarm");
  alarmElement.play();
}

//defining playing the level clear sound at the end of the day

function playLevelClear() {
  var levelClearElement = document.getElementById("levelClear");
  levelClearElement.play();
}

function clearAllBlocks() {
  //defining unhighlighting all the blocks before highlighting the next

  var makeItHighlighted = document.getElementById("1-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("1-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("1-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("1-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("1-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("1-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("2-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("2-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("2-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("2-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("2-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("2-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("3-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("3-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("3-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("3-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("3-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("3-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("4-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("4-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("4-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("4-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("4-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("4-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("5-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("5-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("5-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("5-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("5-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("5-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("6-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("6-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("6-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("6-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("6-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("6-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("7-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("7-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("7-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("7-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("7-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("7-6");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("8-1");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("8-2");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("8-3");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("8-4");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("8-5");
  makeItHighlighted.classList.remove("blockhighlight");

  var makeItHighlighted = document.getElementById("8-6");
  makeItHighlighted.classList.remove("blockhighlight");
}

function refreshTime() {
  
  var date = new Date();

  //displaying full time
  var dateString = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York"
  });
  var timeis = "Time: ";
  var formattedString = dateString.replace(", ", " - ");
  timeDisplay.innerHTML = timeis.concat(formattedString);

  //finding minute
  var minutes = date.getMinutes();

  //finding hour
  var hours = date.getHours();
  
  //finding second
  var seconds = date.getSeconds();

  //finding the correct block on the schedule
  if (hours == 9) {
    var blockH = 1;
  }
  if (hours == 10) {
    if (minutes == 0) {
      var blockH = 1;
    }
    if ((minutes > 0, minutes < 56)) {
      var blockH = 2;
    }
    if (minutes > 55) {
      var blockH = 3;
    }
  }
  if (hours == 11) {
    if (minutes < 10) {
      var blockH = 3;
    }
    if (minutes > 9) {
      var blockH = 4;
    }
  }
  if (hours == 12) {
    if (minutes == 0) {
      var blockH = 4;
    }
    if ((minutes > 0, minutes < 56)) {
      var blockH = 5;
    }
    if (minutes > 55) {
      var blockH = 6;
    }
  }
  if (hours == 13) {
    if (minutes < 46) {
      var blockH = 6;
    }
    if (minutes > 45) {
      var blockH = 7;
    }
  }
  if (hours == 14) {
    if (minutes < 41) {
      var blockH = 7;
    }
    if (minutes > 40) {
      var blockH = 8;
    }
  }
  if (hours == 15) {
    if (minutes < 36) {
      var blockH = 8;
    }
    //play the level clear sound when school is over
    if ((minutes == 35) && (seconds == 1)) {
      playLevelClear()
    }
  }
  //highlight horizontal (maybe not it might not look good)
  var selectedRow = "row" + blockH;
  
  var currentElementInRow = document.getElementsByClassName(selectedRow);
  var e;
  for (e = 0; e < currentElementInRow.length; e++) {
    currentElementInRow[e].classList.add("blockhighlight");
  }
  //time until next class
  
  if ((hours < 9) || ((hours == 9) && (minutes < 5))) {
    var hoursUntil = (9 - hours);
    var minutesUntil = (5 - minutes);
    var secondsUntil = (0 - seconds);
  }
  
  if (((hours == 9) && (minutes > 4)) || ((hours == 10) && (minutes < 6))) {
    var hoursUntil = (10 - hours);
    var minutesUntil = (5 - minutes);
    var secondsUntil = (0 - seconds);
  }
  
  if (((hours == 10) && (minutes > 4)) || ((hours == 11) && (minutes < 11))) {
    var hoursUntil = (11 - hours);
    var minutesUntil = (10 - minutes);
    var secondsUntil = (0 - seconds);
  }
  
 if (((hours == 11) && (minutes > 9)) || ((hours == 12) && (minutes < 6))) {
    var hoursUntil = (12 - hours);
    var minutesUntil = (5 - minutes);
    var secondsUntil = (0 - seconds);
  }
  
 if (((hours == 12) && (minutes > 5) && (minutes <56))) {
    var hoursUntil = (12 - hours);
    var minutesUntil = (55 - minutes);
    var secondsUntil = (0 - seconds);
  }
  if (((hours == 12) && (minutes > 55)) || (hours == 13) && (minutes < 49)) {
    var hoursUntil = (13 - hours);
    var minutesUntil = (50 - minutes);
    var secondsUntil = (0 - seconds);
  }
  if (((hours == 13) && (minutes > 50)) || (hours == 14) && (minutes < 46)) {
    var hoursUntil = (14 - hours);
    var minutesUntil = (45 - minutes);
    var secondsUntil = (0 - seconds);
  }
  if (((hours == 14) && (minutes > 45)) || hours > 14) {
    var hoursUntil = (9 - hours);
    var minutesUntil = (5 - minutes);
    var secondsUntil = (0 - seconds);
  }

  //if a number in the "time until" is negative  
  if (hoursUntil < 0) {
    hoursUntil += 24;
  }
  
  if (minutesUntil < 0) {
    hoursUntil -= 1;
    minutesUntil += 60;
  }
  if (secondsUntil < 0) {
    minutesUntil -= 1;
    secondsUntil += 60;
  }
  
  //display it
  timeUntilNextClass.innerHTML = "The next class is in: ".concat(String(hoursUntil) + ":" + String(minutesUntil) + ":" + String(secondsUntil));

  //play sound when class is about to start
  if ((((hours == 9) && (minutes == 2)) || ((hours == 10) && (minutes == 2)) || ((hours == 11) && (minutes == 7)) || ((hours == 12) && ((minutes == 2) || (minutes == 52))) || ((hours == 13) && (minutes == 47)) || ((hours == 14) && (minutes == 42))) && seconds <= 30) {
    playAlarm()
  }
}
setInterval(refreshTime, 1000);

//find the school day (1-6)
function dayNumber() {
  //set aDay to any date (ex: March 12, 2012)
  //set aDaySchoolDay to the school day that it is (1-6)
  //set aDayDay to the day of the week of that day (0-6: sunday to saturday)
  
  var aDay = Date.parse("May 25, 2021");
  
  
  var aDaySchoolDay = 6;
  
  var aDayDay = 2;
  
  var today = Date.now();
  
  var timesToRepeat = Math.floor((today - aDay) / (1000*60*60*24));
  
  
  var loopSchoolDay = aDaySchoolDay;
  
  var loopDay = aDayDay;
  
  for (var i = 0; i !== timesToRepeat; i++){
    
    loopDay++;
    if (loopDay == 7){
      loopDay = 0;
    }
    
    if (loopDay !== (0 || 6)){
      loopSchoolDay++;
      
      if (loopSchoolDay == 7){
        loopSchoolDay = 1;
      }
    }
    else{
      loopSchoolDay -= 1;
    }
  }
    //highlight vertical
  var selectedColumn = "column" + loopSchoolDay;
  
  
  var currentElementInColumn = document.getElementsByClassName("column" + loopSchoolDay);
  var e;
  for (e = 0; e < currentElementInColumn.length; e++) {
    currentElementInColumn[e].classList.add("blockhighlight");
  }
}

dayNumber();


//if the current class has changed, reset the table


setInterval(checkSwitchClass, 1);
setInterval(switchClass1, 10);
setInterval(switchClass2, 100);

function checkSwitchClass(){
  if (currentClass !== lastSecondsClass){
    clearAllBlocks();
    dayNumber();
  }
  console.log(currentClass);
  console.log(lastSecondsClass);
}

function switchClass1(){
  currentClass = blockH;
}

function switchClass2(){
  lastSecondsClass = blockH;
}

let currentClass;
let lastSecondsClass;