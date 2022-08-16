function sendInput(space){
  var input = document.getElementById("inputBox").value.toLowerCase().replace(/[^a-zA-Z ]/g, "");;
  
  let output = " ";
  
  var repeatTimes = input.length;
  if(space){
    for (var repeats = 0; repeats < repeatTimes; repeats++){
      if(input.charAt(repeats) == " "){
        output += " ";
      }
      else{
        output += (":regional_indicator_" + input.charAt(repeats) + ": ")
      }
    }
  }
  else{
    for (var repeats = 0; repeats < repeatTimes; repeats++){
      if(input.charAt(repeats) == " "){
        output += "";
      }
      else{
        output += (":regional_indicator_" + input.charAt(repeats) + ":")
      }
    }
  }
  document.getElementById("output").innerHTML = output;
}

function copyOutput() {
  var copyText = document.getElementById("output");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
}