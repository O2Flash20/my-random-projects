
showTopicsList()

function createElement(type, parent, className, innerHTML) {
  let element = document.createElement(type)
  element.innerHTML = innerHTML
  element.className = className

  parent.appendChild(element)

  return element
}

let currentQuestion

function displayQuestion(questionObject) {
  if (questionObject) {
    let div = document.getElementById("quizHolder")
    div.innerHTML = ""

    console.log(currentQuestion[1] + 1)
    createElement("h1", div, "question", "Question " + (currentQuestion[1] + 1) + ": " + questionObject.question)

    let list = createElement("ol", div, "answersList", null)
    list.type = "a"
    for (let i = 0; i < questionObject.answers.length; i++) {
      createElement("li", list, "answerListItem", questionObject.answers[i])
    }

    let buttonsHolder = createElement("div", div, "answerButtonsHolder", null)
    for (let i = 0; i < questionObject.answers.length; i++) {
      // ai wrote this for me lol
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

      let button = createElement("button", buttonsHolder, "answerButton", letters[i])
      if (questionObject.correctAnswer == i) {
        button.onclick = correctAnswer
      } else {
        button.onclick = badAnswer
      }
    }

    let prevButton = createElement("button", div, "prevButton", "Previous Question")
    prevButton.addEventListener("click", function () {
      switchQuestion("backward")
    })

    let nextButton = createElement("button", div, "nextButton", "Next Question")
    nextButton.addEventListener("click", function () {
      switchQuestion("forward")
    })
  }
}

function switchQuestion(direction) {
  if (direction === "forward") {
    if (currentQuestion[0].questions[currentQuestion[1] + 1]) {
      currentQuestion = [currentQuestion[0], currentQuestion[1] + 1]
      displayQuestion(currentQuestion[0].questions[currentQuestion[1]])
    }
  } else if (direction === "backward") {
    if (currentQuestion[0].questions[currentQuestion[1] - 1]) {
      currentQuestion = [currentQuestion[0], currentQuestion[1] - 1]
      displayQuestion(currentQuestion[0].questions[currentQuestion[1]])
    }
  }
}

function correctAnswer() {
  alert("Good job!")
}

function badAnswer() {
  alert("Bad job!")
}

function showTopicsList() {
  for (topic of Object.keys(quiz)) {
    let topicObject = quiz[topic]

    let topicName = createElement("div", document.getElementById("topicsList"), "topicName", topicObject.className)

    let i = 0
    for (question of topicObject.questions) {
      i++
      let p = createElement("p", topicName, "questionNumber", "Question " + i)

      const ie = i - 1
      p.addEventListener("click", function () {
        currentQuestion = [topicObject, ie]
        displayQuestion(topicObject.questions[ie])
      })
    }
  }
}