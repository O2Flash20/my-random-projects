class Boid{
    constructor(pos, vel){
        this.pos = pos
        this.vel = vel
        this.acc = createVector(0, 0)
        this.maxSteering = 0.01
        this.maxSpeed = 2
    }

    align(boids, dist){
        let steering = createVector(0, 0)
        let boidsInDist = 0
        // make it check for boids on the other side of an edge by tiling the boids a lot of times 
        for(let i=0;i<boids.length; i++){
            const d = this.pos.dist(boids[i].pos)
            if (d < dist && boids[i]!==this){  
                steering.add(boids[i].vel)
                boidsInDist++
            }
        }
        
        if (boidsInDist > 0){
            steering.div(boidsInDist)
            steering.setMag(this.maxSpeed)
            // this.vel = this.vel.copy().add(steering).normalize()
            steering.sub(this.vel)
            this.acc = steering.limit(this.maxSteering)
        }
    }

    cohesion(boids, dist){
        let steering = createVector(0, 0)
        let boidsInDist = 0
        // make it check for boids on the other side of an edge by tiling the boids a lot of times 
        for(let i=0;i<boids.length; i++){
            const d = this.pos.dist(boids[i].pos)
            if (d < dist && boids[i]!==this){  
                steering.add(boids[i].position)
                boidsInDist++
            }
        }
        
        if (boidsInDist > 0){
            steering.div(boidsInDist)
            steering.sub(this.pos)
            steering.setMag(this.maxSpeed)
            steering.sub(this.vel)
            this.acc = steering.limit(this.maxSteering)
        }
    }

    show(){
        circle(this.pos.x, this.pos.y, 5)
    }

    update(){
        this.vel.add(this.acc)
        this.pos.add(this.vel)

        this.pos.x = (this.pos.x+width*5) % width
        this.pos.y = (this.pos.y+height*5) % height
    }
}