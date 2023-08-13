// class Project {
//     constructor(contentWindowORUrl, title, description) {
//         if (typeof contentWindowORUrl === "string") {
//             // is a url
//             this.title = title
//             this.description = description
//             this.url = contentWindowORUrl
//         } else {
//             // is a contentWindow
//             this.title = contentWindowORUrl.document.head.querySelector("title").innerHTML
//             this.url = contentWindowORUrl.location.href

//             for (let meta of contentWindowORUrl.document.head.querySelectorAll("meta")) {
//                 if (meta.name == "description") { this.description = meta.content; return }
//             }
//         }
//     }
// }

class Project {
    constructor(document, url) {
        // if (typeof contentWindowORUrl === "string") {
        //     // is a url
        //     this.title = title
        //     this.description = description
        //     this.url = contentWindowORUrl
        // } else {
        //     // is a contentWindow
        //     this.title = contentWindowORUrl.document.head.querySelector("title").innerHTML
        //     this.url = contentWindowORUrl.location.href

        //     for (let meta of contentWindowORUrl.document.head.querySelectorAll("meta")) {
        //         if (meta.name == "description") { this.description = meta.content; return }
        //     }
        // }
        this.title = document.head.querySelector("title").innerHTML
        this.url = url
        for (let meta of document.head.querySelectorAll("meta")) {
            if (meta.name == "description") { this.description = meta.content; return }
        }
    }
}