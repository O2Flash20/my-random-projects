//when the submit button is pressed to find the book
function findBook() {
  //get the input value for the room
  
  var roomInputLetters = document.getElementById("roomInput").value.replace(/[^a-zA-Z ]/g, "");
  
  //get the length of the room input
  var roomInputLettersLength = roomInputLetters.length;
  
  //for every character in the room input, get its number and add it to the number string
  let currentInputChar = 0;
  for (currentInputChar = 0;  currentInputChar !== roomInputLettersLength; currentInputChar++){
    
    //getting the HEX code of the current character
    var currentCharCode = roomInputLetters.charCodeAt(currentInputChar)
    console.log(currentCharCode);
  }
}