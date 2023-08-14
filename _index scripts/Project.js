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

class OnixProject {
    constructor(name) {
        this.url = "Onix Scripts/pages/" + name + ".html"

        fetch(this.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch HTML file: ${response.status} ${response.statusText}`)
                }
                return response.text()
            })
            .then(htmlContent => {
                const parser = new DOMParser()
                const doc = parser.parseFromString(htmlContent, 'text/html')

                // debugger

                if (doc.head.querySelector("title")) {
                    this.title = doc.head.querySelector("title").innerHTML
                }
                else {
                    this.title = "No Title"
                }

                for (let meta of doc.head.querySelectorAll("meta")) {
                    if (meta.name == "description") {
                        this.description = meta.content
                    }
                    else {
                        this.description = "No Description"
                    }
                }
            })
    }
}