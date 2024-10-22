export default class Scene {
    constructor() {
        this.objects = []
    }

    addObject(object) {
        this.objects.push(object)
    }

    draw(renderPass) {
        for (let object of this.objects) {
            object.draw(renderPass) //each object runs shader code itself to be drawn
        }
    }
}

// include lights here?
// lights should be done in the deferred step