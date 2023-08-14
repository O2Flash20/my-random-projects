const ProjectList = [
    {
        url: "cloth simulation/index.html",
        folder: "Simulations",
        rating: 4.5
    },
    {
        url: "RAYCASTING_2/index.html",
        folder: "3D Renders"
    },
    {
        url: "G_PROCEDURAL TEXTURES/index.html",
        folder: "Tools"
    },
    {
        url: "WALL DESTRUCTION/index.html",
        folder: "Games"
    },
    {
        url: "RAYMARCHING/index.html",
        folder: "3D Renders"
    },
    {
        url: "triangle thing 3 epic boogalee/index.html",
        folder: "Generative Art"
    },
    {
        url: "trails/index.html",
        folder: "Generative Art"
    },
    {
        url: "light simulation/index.html",
        folder: "Simulations"
    },
    {
        url: "color guesser/index.html",
        folder: "Games"
    },
    {
        url: "inverse kinematics/inverse/index.html",
        folder: "Simulations"
    },
    {
        url: "inverse kinematics/forward/index.html",
        folder: "Simulations"
    },
    {
        url: "cyoobcast background/index.html",
        folder: "Generative Art"
    },
    {
        url: "SHADERS/infinite pattern/index.html",
        folder: "Generative Art"
    },
    {
        url: "SHADERS/wind wave/index.html",
        folder: "Generative Art"
    },
    {
        url: "TETRIS/index.html",
        folder: "Games"
    },
    {
        url: "SHADERS/metaballs/index.html",
        folder: "Generative Art"
    },
    {
        url: "old glitch projects/ascii post processing/index.html",
        folder: "Tools"
    },
    {
        url: "SHADERS/3d glasses/index.html",
        folder: "Simulations"
    },
    {
        url: "SHADERS/edge detect/index.html",
        folder: "Generative Art"
    },
    {
        url: "SHADERS/motion detection shader/index.html",
        folder: "Tools"
    },
    {
        url: "SHADERS/webcam rgb shift/index.html",
        folder: "Generative Art"
    },
    {
        url: "SHADERS/motion blur/index.html",
        folder: "Generative Art"
    },
    {
        url: "triangle thing 2 electric boogaloo/index.html",
        folder: "Generative Art"
    },
    {
        url: "vtuber2/index.html",
        folder: "Tools"
    },
    {
        url: "particle system/index.html",
        folder: "Simulations"
    },
    {
        url: "old glitch projects/discord big text/index.html",
        folder: "Tools"
    },
    {
        url: "old glitch projects/canvas game/index.html",
        folder: "Generative Art"
    },
    {
        url: "smooth noise/index.html",
        folder: "Generative Art"
    },
    {
        url: "SHADERS/blur/index.html",
        folder: "Generative Art"
    },
    {
        url: "SHADERS/mouse gradient/index.html",
        folder: "Generative Art"
    },
    {
        url: "triangle thing/index.html",
        folder: "Generative Art"
    },
    {
        url: "fake word generator/index.html",
        folder: "Tools"
    },
    {
        url: "old glitch projects/website learns to write/index.html",
        folder: "Generative Art"
    },
    {
        url: "sprite system/index.html",
        folder: "Games"
    },
    {
        url: "old glitch projects/bunger nft/index.html",
        folder: "Joke Websites"
    },
    {
        url: "RAYCASTING GAME/versions/4-current/index.html",
        folder: "Games"
    },
    {
        url: "old glitch projects/game engine/index.html",
        folder: "Games"
    },
    {
        url: "old glitch projects/wrm minecraft music/index.html",
        folder: "Tools"
    },
    {
        url: "old glitch projects/wr game/index.html",
        folder: "Games"
    },
    { //!get rid of this?
        url: "old glitch projects/display filters/index.html",
        folder: "Tools"
    },
    {
        url: "SHADERS/basic gradient/index.html",
        folder: "Generative Art"
    },
    {
        url: "graphing calculator/index.html",
        folder: "Tools"
    },
    {
        url: "old glitch projects/break the cycle/index.html",
        folder: "Joke Websites"
    },
    {
        url: "old glitch projects/biscord/index.html",
        folder: "Joke Websites"
    }
]

for (let p of ProjectList) {
    getInfo(p.url, p.folder)
}

const OnixProjectList = [
    {
        name: "blockToTexture"
    },
    {
        name: "cosmeticTools"
    },
    {
        name: "logger"
    },
    {
        name: "vectors"
    },
    {
        name: "3dView"
    },
    {
        name: "arrowTrail"
    },
    {
        name: "betterHunger"
    },
    {
        name: "blockMap"
    },
    {
        name: "bridgeOverlay"
    },
    {
        name: "cameraAnimations"
    },
    {
        name: "cosmetics"
    },
    {
        name: "DevBlockLeaker"
    },
    {
        name: "freecam"
    },
    {
        name: "ImmersiveFirstPerson"
    },
    {
        name: "lagSwitch"
    },
    {
        name: "miniMap"
    },
    {
        name: "PvPHelper"
    },
    {
        name: "quickWaypoints"
    },
    {
        name: "raytracing"
    },
    {
        name: "replayMod"
    },
    {
        name: "ReplayModOld"
    },
    {
        name: "winParticles"
    },
]

let test = 0
let test1 = 0
for (let project of OnixProjectList) {
    if (!folders["Onix Client Scripts"]) { folders["Onix Client Scripts"] = [new OnixProject("whatIsOnixClient")] }
    folders["Onix Client Scripts"].push(new OnixProject(project.name))
    const urlInRepo = "https://raw.githubusercontent.com/O2Flash20/My-Onix-Client-Scripts-Folder/main/Modules/" + project.name + ".lua"
    checkURLExists(urlInRepo)
    // console.log("https://raw.githubusercontent.com/OnixClient-Scripts/OnixClient_Scripts/master/Modules/" + project.name + ".lua")
}

function checkURLExists(url) {
    return fetch(url)
        .then(response => {
            if (response.status === 200) {
                console.log("yes")
                return true // URL exists (status code 200 OK)
            } else if (response.status === 404) {
                console.log("no")
                return false // URL doesn't exist (status code 404 Not Found)
            } else {
                // Handle other status codes if needed
                console.log("no")
                return false
            }
        })
        .catch(error => {
            console.error("Error checking URL:", error)
            return false // Error occurred, URL likely doesn't exist
        })
}

/* TODO
be able to determine the order of the folders and projects
rating value
"finished" indicator
add Onix scripts

!FIX TETRIS (why borken)
*/