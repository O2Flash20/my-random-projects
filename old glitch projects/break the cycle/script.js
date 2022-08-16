function donto(){
  alert("the donation of $100,000,000 has gone through thank");
  console.log("yes")
}

function login(){
  if (document.cookie == ''){
    prompt("what is your name")
  }
}

function setCookies(name, value){
  document.cookie = `name=${name}; cvalue=${value}; expires=Thu, 18 Dec 2043 12:00:00 UTC`
}

function getCookies(){
  return document.cookie
}