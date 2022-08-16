function include(url, hide) {
    let div = document.createElement("div")
    div.classList.add("projectBox")
    document.getElementById("projects").append(div)

    let iFrame = document.createElement("iframe")
    iFrame.src = url

    if (hide) { iFrame.classList.add("remove") }

    div.append(iFrame)

    div.innerHTML = `${div.innerHTML} <br> <a href="${url}">To Page</a>`

    particles.push({ pos: [Math.random() * window.innerWidth, Math.random() * window.innerHeight], vel: [Math.random() * 10 - 5, Math.random() * 10 - 5] })

    done.push(false)
}

let done = []
function getProjectDetails() {
    for (let i = 0; i < document.getElementById("projects").children.length; i++) {
        let project = document.getElementById("projects").children[i].querySelector("iframe").contentWindow.document
        let projectWindow = document.getElementById("projects").children[i].querySelector("iframe").contentWindow

        if (project.body == null) {
            setTimeout(getProjectDetails, 1000)
            break
        } else if (project.body.innerHTML == "") {
            setTimeout(getProjectDetails, 1000)
            break
        }

        if (!done[i]) {

            document.getElementById("projects").children[i].innerHTML = `<h2>${project.head.querySelector("title").innerText}</h2>${document.getElementById("projects").children[i].innerHTML}`

            // doesnt work because needs full file path
            // using window.location.origin?
            // projectWindow.eval("document.head.classList.add(location.origin)")
            projectWindow.eval("console.log(location)")
            console.log(projectWindow.location.origin)
            for (let j = 0; j < project.head.querySelectorAll("script").length; j++) {
                if (project.head.querySelectorAll("script")[j].src == "libraries/p5.min.js") {
                    console.log("does")
                }
            }
            for (let j = 0; j < project.body.querySelectorAll("script").length; j++) {
                if (project.body.querySelectorAll("script")[j].src !== "") {
                    document.getElementById("projects").children[i].append(document.createElement("br"))
                    let link = document.createElement("a")
                    link.href = project.body.querySelectorAll("script")[j].src
                    link.innerText = "View script"
                    document.getElementById("projects").children[i].append(link)
                }
            }

            for (let j = 0; j < project.head.querySelectorAll("meta").length; j++) {
                if (project.head.querySelectorAll("meta")[j].name == "description") {
                    let p = document.createElement("p")
                    p.innerText = project.head.querySelectorAll("meta")[j].content
                    document.getElementById("projects").children[i].append(p)
                }
            }

            if (document.getElementById("projects").children[i].querySelector("iframe").classList.contains("remove")) {
                document.getElementById("projects").children[i].querySelector("iframe").remove()
            }

            done[i] = true
        }
    }
}

let particles = []
setInterval(function () {
    for (let i = 0; i < particles.length; i++) {
        document.getElementById("projects").children[i].style.top = particles[i].pos[1] + "px"
        document.getElementById("projects").children[i].style.right = particles[i].pos[0] + "px"

        particles[i].pos[0] += particles[i].vel[0]
        particles[i].pos[1] += particles[i].vel[1]

        const xPos = particles[i].pos[0]
        const yPos = particles[i].pos[1]
        if (xPos < 0) {
            particles[i].pos[0] = 1
            particles[i].vel[0] *= -1
        }
        if (xPos > window.innerWidth) {
            particles[i].pos[0] = window.innerWidth - 1
            particles[i].vel[0] *= -1
        }
        if (yPos < 0) {
            particles[i].pos[1] = 1
            particles[i].vel[1] *= -1
        }
        if (yPos > window.innerHeight) {
            particles[i].pos[1] = window.innerHeight - 1
            particles[i].vel[1] *= -1
        }

    }
}, 100)

/*

*/