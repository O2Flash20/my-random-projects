module.exports = function(controller) {
  //saying hello
  controller.hears("hello there", ["direct_mention", "mention"], (bot, message) => {
    bot.reply(message, "hey " + message.user);
  });
  
  //repeating what person says
  controller.hears("say ", "ambient", (bot, message) => {
    let toSay = ""
    
    for(let i = 4; i < message.text.length; i++){
      toSay+= message.text.charAt(i)
    }
        
    bot.reply(message, toSay);
  });
  
  //counting game
  controller.hears("#", "ambient", (bot, message) =>{
    let userNumber = ""
    for (let i = 1; i < message.text.length; i++){
      userNumber+=message.text.charAt(i)
    }
    
    if(Number.isInteger(parseInt(userNumber))){ 
      if(userNumber == currentCount+1){
        currentCount++
        bot.reply(message, "**Correct!**")
      }else{
        currentCount = 0
        bot.reply(message, "**you messed it up, count is now 0**")
      }
    }
    else if(userNumber == "?"){
      bot.reply(message, "The current number is " + currentCount)
    }
    else{
      bot.reply(message, "That isn't a number silly")
    }
  })
};

let currentCount = 0

//removing the command
function removeCommandChar(lengthOfCommand, input){
  let output = ""
  
  for (let i = lengthOfCommand; i < input.length; i++){
    output+=input.charAt(i)
  }
  
  return output
}

/*
controller.hears(,"ambient", (bot, message)=>{
  bot.reply(message,)
})
*/