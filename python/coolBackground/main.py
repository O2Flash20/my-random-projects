from cmath import inf
from fileinput import close
from random import randint
import pygame
from sys import exit

pygame.init()
screen = pygame.display.set_mode((1920, 1036),  pygame.RESIZABLE)
pygame.display.set_caption("Cool Background ig")
clock = pygame.time.Clock()


class Point():
    def __init__(self, pos, vel):
        self.pos = pos
        self.vel = vel

    def update(self):
        self.pos += self.vel

        if self.pos.x > 1920:
            self.pos.x = 0
        if self.pos.x < 0:
            self.pos.x = 1920

        if self.pos.y > 1036:
            self.pos.y = 0
        if self.pos.y < 0:
            self.pos.y = 1036

    def show(self):
        pygame.draw.circle(screen, "White", (self.pos.x, self.pos.y), 5)


points = []
for i in range(20):
    points.append(Point(pygame.Vector2((randint(0, 1920), randint(
        0, 1036))), pygame.Vector2((randint(-3, 3), randint(-3, 3)))))


# --------------------------------------

screen.fill((51, 51, 51))

for point in points:
    point.update()
    point.show()

# pointIndex = randint(0, len(points)-1)
for pointIndex in range(len(points)):
    pointIndex = 0

    closestDist = inf
    closestIndex = -1
    lastClosestIndex = -2

    pygame.draw.circle(
        screen, "Red", (points[pointIndex].pos.x, points[pointIndex].pos.y), 4)

    for point in points:
        if point != points[pointIndex]:

            pygame.draw.circle(screen, "Green", (point.pos.x, point.pos.y), 4)

            if point.pos.distance_squared_to(points[pointIndex].pos) < closestDist:
                lastClosestIndex = closestIndex
                closestIndex = points.index(point)
                closestDist = point.pos.distance_squared_to(
                    points[pointIndex].pos)
                print(closestDist)

    pygame.draw.polygon(screen, "White", [(points[pointIndex].pos.x, points[pointIndex].pos.y), (
        points[closestIndex].pos.x, points[closestIndex].pos.y), (points[lastClosestIndex].pos.x, points[lastClosestIndex].pos.y)], 2)

pygame.display.update()

# --------------------------------------
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()

    clock.tick(60)
