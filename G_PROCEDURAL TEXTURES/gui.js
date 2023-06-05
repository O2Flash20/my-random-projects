class Material {
    constructor(size) {
        this.size = size
        this.maps = []
    }

    // addMap
    // download
}

class Map {
    constructor() {
        this.layers = []
        this.type = null
    }

    // addMerge
    // addLayer
    // ?auto-generate for specific types
}

class Merge {
    constructor() {
        this.layers = []
        this.type = null
    }

    // addLayer
}

class Layer {
    constructor() {
        this.effects = []
        this.type = null
    }

    // addEffect
}

class Effect {
    constructor() {
        this.type = null
    }
}

// material to text function