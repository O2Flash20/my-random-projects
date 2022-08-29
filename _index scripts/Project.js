class Project {
    constructor(contentWindow) {
        this.title = contentWindow.document.head.querySelector("title").innerHTML
        this.url = contentWindow.location.href

        for (let meta of contentWindow.document.head.querySelectorAll("meta")) {
            if (meta.name == "description") { this.description = meta.content; return }
        }
    }
}