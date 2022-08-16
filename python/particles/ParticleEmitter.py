import pygame
from Particle import *

class Emitter():
    def __init__(self, screen, pos, lifeTime):
        self.particles = []

        self.lifeTime = lifeTime

        self.pos = pos
        self.vel = pygame.Vector2()
        self.acc = pygame.Vector2()

        self.screen = screen
    
    def applyForce(self, force):
        self.acc += force

    def emit(self):
        self.particles.append(Particle(self.screen, pygame.Vector2(self.pos)))
    
    def update(self):
        self.vel += self.acc 
        self.pos += self.vel

        for particle in self.particles:
            particle.update()

            particle.applyForce(self.acc)

            if particle.life > self.lifeTime: 
                self.particles.remove(particle)

        self.acc *= 0

    def show(self, color):
        for particle in self.particles:
            particle.show(color)