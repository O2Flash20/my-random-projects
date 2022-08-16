//setInterval(convert, 1000);

function convert(){
  var input = document.getElementById("decimalInput").value;
  
  var inputInt = parseFloat(input);
  
  let inputInLoop = inputInt;
  let outputString;
  let halfInputInLoop = inputInt;
  
  for (;inputInLoop !== 0;){
    inputInLoop = halfInputInLoop;
    
    halfInputInLoop = inputInLoop / 2; 
    
    outputString += toString(inputInLoop % halfInputInLoop);
    console.log("es");
    console.log(inputInLoop);
  }
  //console.log(outputString);
}