const ascii = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^'.    `

let img
function preload() {
    img = loadImage("drawing.png")
}

let c
function setup() {
    createCanvas(957, 674)
    imageMode(CENTER)

    c = createGraphics(width, height)
    c.fill(255)
    c.noStroke()
    c.textFont('Courier New', 8)
}

let t = 0
function draw() {
    background(51)
    t += deltaTime / 1000

    translate(478.5, 337)
    translate(-86.0031266888, -55.4114104841) //at infinite smaller images, the smallest will be centered at about this value
    scale((7.4765 ** ((t / 2) % 1)))
    translate(86.0031266888, 55.4114104841)

    image(img, 0, 0, 957, 674)

    let lastX = 0
    let lastY = 0
    for (let i = 0; i < 3; i++) {
        lastX = 74.5 / (7.4765 ** i) + lastX
        lastY = 48 / (7.4765 ** i) + lastY
        image(img, -lastX, -lastY, 128 / (7.4765 ** i), 90 / (7.4765 ** i))
    }

    c.background(0)
    loadPixels()
    for (let x = 0; x < width; x += 10) {
        for (let y = 0; y < height; y += 10) {
            const thisR = pixels[4 * (x + y * width)]
            const thisG = pixels[4 * (x + y * width) + 1]
            const thisB = pixels[4 * (x + y * width) + 2]
            const thisBrightness = (thisR + thisG + thisB) / 3
            const asciiValue = brightnessToAscii(thisBrightness)

            let thisColor = rgbToHsl(thisR, thisG, thisB)
            thisColor[2] = (thisColor[2] - 0.5) / 2 + 0.5 //this is for it to use the shade of the original colour of the pixel less, and instead rely on the ascii character for shading
            thisColor = hslToRgb(thisColor[0], thisColor[1], thisColor[2])
            c.fill(thisColor[0], thisColor[1], thisColor[2])

            c.text(asciiValue, x, y)
        }
    }
}

function map(value, min1, max1, min2, max2) {
    return (value - min1) * ((max2 - min2) / (max1 - min1)) + min2
}
function brightnessToAscii(brightness) {
    return ascii.charAt(Math.floor(map(brightness, 255, 0, 0, ascii.length)))
}

// https://gist.github.com/mjackson/5311256
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255
    var max = Math.max(r, g, b), min = Math.min(r, g, b)
    var h, s, l = (max + min) / 2
    if (max == min) {
        h = s = 0 // achromatic
    } else {
        var d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }
    return [h, s, l]
}
function hslToRgb(h, s, l) {
    var r, g, b
    if (s == 0) {
        r = g = b = l // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }
    return [r * 255, g * 255, b * 255]
}