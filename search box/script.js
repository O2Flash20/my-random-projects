let words = ["Among Us", "Funny", "Haha"]
let scores = []

function search(keyword) {
    scores = []
    // each word
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        scores.push(0)
        // each letter
        for (let j = 0; j < word.length; j++) {
            // each letter in the keyword
            const offset = 0.01 * j
            for (let k = 0; k < keyword.length; k++) {
                if (word[j + k] && keyword[k]) {
                    if (word[j + k].toLowerCase() == keyword[k].toLowerCase()) {
                        scores[i] += (1 - offset)
                    }
                }
            }
        }
    }

    console.log(scores)
    return scores

}

document.getElementById("the").addEventListener("change", function () {
    search(document.getElementById("the").value)
})

/*
+1 score for each letter that matches
-0.01 score for each "offset" (first letters matching up = full points)
*/