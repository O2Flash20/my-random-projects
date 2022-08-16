from random import randint
import pygame
from sys import exit
from Particle import *
from ParticleEmitter import *

from Particle import Particle

pygame.init()
screen = pygame.display.set_mode((1920, 1036),  pygame.RESIZABLE)
pygame.display.set_caption("Particle System Test")
clock = pygame.time.Clock()

emitters = []

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()

        if event.type == pygame.MOUSEBUTTONDOWN:
            emitters.append(Emitter(screen, pygame.Vector2((event.pos)), 1000))
    
    # screen.fill((randint(0, 255), randint(0, 255), randint(0, 255)))
    screen.fill((clock.get_fps(), clock.get_fps(), clock.get_fps()))

    for emitter in emitters:
        emitter.emit()
        emitter.update()
        # emitter.show((randint(0, 255), randint(0, 255), randint(0, 255)))
        emitter.show((255, 255, 255))

        emitter.particles[len(emitter.particles)-1].applyForce(pygame.Vector2((randint(-100, 100)/15), randint(-100, 100)/15))

        for particle in emitter.particles:
            particle.applyForce((0, 0.5))

    # print(clock.get_fps())

    pygame.display.update()
    clock.tick(60)