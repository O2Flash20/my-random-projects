import pygame


import pygame

def mapR(val, min1, max1, min2, max2):
    return (val-min1)*((max2-min2)/(max1-min1))+min2

def showFPS(surface, clock):
    font = pygame.font.SysFont("Arial")
    surface.blit(font.render(clock.get_fps(), True, "White"), (0, 0))