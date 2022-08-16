let ids = []


function openUI() {
    document.getElementById("uiHolder").classList.remove("hidden")
    closeRemoveUI()
    closeIDUI()
}

function closeUI() {
    document.getElementById("uiHolder").classList.add("hidden")
}

function openRemoveUI() {
    document.getElementById("removeUiHolder").classList.remove("hidden")
    closeUI()
    closeIDUI()
}

function closeRemoveUI() {
    document.getElementById("removeUiHolder").classList.add("hidden")
}

function openIDUI() {
    document.getElementById("idListHolder").classList.remove("hidden")
    closeUI()
    closeRemoveUI()
}

function closeIDUI() {
    document.getElementById("idListHolder").classList.add("hidden")
}

function creeteElement() {

    var elementType = document.getElementById("type").value.toUpperCase()

    var elementText = document.getElementById("text").value

    var elementId = document.getElementById("id").value

    var elementClass = document.getElementById("class").value

    var elementSrc = document.getElementById("src").value

    var elementHref = document.getElementById("href").value

    //create element with type
    var elm = document.createElement(elementType)

    //add text
    elm.innerHTML = elementText

    //add id
    elm.id = elementId

    ids.push(elementId)
    document.getElementById("IDlist").innerHTML = ids

    //add class
    elm.classList.add = elementClass

    //add src
    elm.src = elementSrc

    //add href
    elm.href = elementHref

    //put in custom div
    document.getElementById("custom").appendChild(elm)
}

function removeElement() {

    var removeId = document.getElementById("removeId").value

    if (ids.includes(removeId)) {
        var remove = document.getElementById(removeId)
        remove.remove()

    }
}