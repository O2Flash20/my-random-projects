class Project {
    constructor(document, url) {
        if (document.head.querySelector("title")) {
            this.title = document.head.querySelector("title").innerHTML
        }
        else {
            this.title = "No Title"
        }
        this.url = url
        for (let meta of document.head.querySelectorAll("meta")) {
            if (meta.name == "description") {
                this.description = meta.content
                return
            }
            this.description = "No Description"
        }
    }
}