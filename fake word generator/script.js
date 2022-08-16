/*
average syllables = 3
average word length = 1.66 syllables
average letters = 5

e	509,862
a	421,032
i	416,112
o	379,091
u	164,728

TOTAL 1890825
e 26.9651
a 22.2671
i 22.0069
o 20.049
u 8.712

12,000	E	            2,500	F
9,000	T	            2,000	W, Y
8,000	A, I, N, O, S	1,700	G, P
6,400	H            	1,600	B
6,200	R	            1,200	V
4,400	D	            800	K
4,000	L	            500	Q
3,400	U	            400	J, X
3,000	C, M	        200	Z

TOTAL 67000
t 0.134328
n 0.119403
s 0.119403
h 0.095522
r 0.092537
d 0.065672
l 0.059701
c 0.044776
m 0.044776
f 0.037313
w 0.029851
y 0.029851
g 0.025373
p 0.025373
b 0.023881
v 0.01791
k 0.01194
q 0.007463
j 0.00597
x 0.00597
z 0.002985

per word
1 syllable 20
2 syllables 50
3 syllables 15
4 syllables 10
5 syllables 5

per syllable:
2 letters: 25
3 letters: 50
4 letters: 25

1. pick number of syllables
1.5. pick number of letters
2. pick vowel position
3. pick vowel
4. pick consonant
5. put together
*/

let consonants = [
    [13, "t"],
    [12, "n"],
    [12, "s"],
    [10, "h"],
    [9, "r"],
    [7, "d"],
    [6, "l"],
    [4, "c"],
    [4, "m"],
    [4, "f"],
    [3, "w"],
    [3, "y"],
    [3, "g"],
    [3, "p"],
    [2, "b"],
    [2, "v"],
    [1, "k"],
    [0.5, "q"],
    [0.5, "j"],
    [0.5, "x"],
    [0.5, "z"]
]
let vowels = [
    [27, "e"],
    [22, "a"],
    [22, "i"],
    [20, "o"],
    [9, "u"]
]
let syllables = [
    [20, 1],
    [65, 2],
    [10, 3],
    [5, 4],
]
let letters = [
    [35, 2],
    [55, 3],
    [10, 4]
]
let vowel = [
    [10, 0],
    [70, 1],
    [20, 2]
]


function getFromProbTable(table) {
    let number = Math.random() * 100
    let startProb = 0
    let endProb = 0
    for (let i = 0; i < table.length; i++) {
        endProb += table[i][0]

        if (number >= startProb && number <= endProb) {
            return table[i][1]
        }

        startProb = endProb
    }
}

function enter() {
    for (let z = 0; z < 1000; z++) {
        let div = document.createElement("div")
        document.body.appendChild(div)
        let out = ""
        const syl = getFromProbTable(syllables)
        for (let i = 0; i < syl; i++) {
            const lett = getFromProbTable(letters)
            // const vowelPos = Math.floor(Math.random() * lett)
            let vowelPos = 10
            while (vowelPos >= lett) {
                vowelPos = getFromProbTable(vowel)
            }
            for (let j = 0; j < lett; j++) {
                if (j == vowelPos) { letter = getFromProbTable(vowels) }
                else { letter = getFromProbTable(consonants) }
                out = out + letter
            }
        }
        out = out.charAt(0).toUpperCase() + out.slice(1)
        div.innerHTML = out
    }
}