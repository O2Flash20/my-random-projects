function setup() {
    createCanvas(window.innerWidth, window.innerHeight)
    noLoop()
}

function draw() {
    background(51)
}

function loadSongs() {
    for (playlist of playlists) {
        let div = document.createElement("div")
        document.body.append(div)
        let title = document.createElement("h2")
        div.append(title)
        title.innerText = playlist.name

        for (song of playlist.songs) {
            let songE = document.createElement("p")
            songE.addEventListener("click", function () {
                playSong(song.file)
            })
            songE.innerText = song.name

            div.append(songE)
        }
    }
}

let currentSong = null
function playSong(src) {
    let audio = new Audio(src)
    audio.play()

    currentSong = audio
}
// currentSong.duration
// currentSong.currentTime

loadSongs()