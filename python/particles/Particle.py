import pygame

class Particle():
    def __init__(self, screen, pos):
        self.pos = pos
        self.vel = pygame.Vector2()
        self.acc = pygame.Vector2()
        self.life = 0

        self.screen = screen

    def applyForce(self, force):
        self.acc += force
    
    def update(self):
        self.vel += self.acc
        self.pos += self.vel
        self.acc *= 0

        self.life += 1

    def show(self, color):
        pygame.draw.circle(self.screen, color, (self.pos.x, self.pos.y), 5)