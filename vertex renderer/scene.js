export default class Scene {
    constructor() {
        this.objects = []
        this.pointLights = []
        this.directionalLights = []
    }

    addObject(object) {
        this.objects.push(object)
    }

    addPointLight(position, strength, color) { //color is in the form [r, g, b]
        this.pointLights.push({pos: position, strength, color})
    }

    addDirectionalLight(direction, strength, color) { //color is in the form [r, g, b]
        this.directionalLights.push({dir: direction, strength, color})
    }

    draw(renderPass) {
        for (let object of this.objects) {
            object.draw(renderPass) //each object runs shader code itself to be drawn
        }
    }
}

// include lights here?
// lights should be done in the deferred step