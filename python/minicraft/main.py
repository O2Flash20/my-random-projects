from math import floor
import pygame
from sys import exit
from perlin_noise import PerlinNoise

pygame.init()
screen = pygame.display.set_mode((1920, 1036),  pygame.RESIZABLE)
pygame.display.set_caption("IDK name yet")
clock = pygame.time.Clock()

display = pygame.Surface((200, 100))


def mapR(val, min1, max1, min2, max2):
    return (val-min1)*((max2-min2)/(max1-min1))+min2


class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()

        self.playerStand1 = pygame.image.load(
            "textures/player.png").convert_alpha()
        self.image = self.playerStand1
        self.rect = self.image.get_rect(center=(32, 34))

        self.location = pygame.Vector2((2, 3))

    def inputs(self):
        global yOff, xOff
        if keys[pygame.K_w]:
            self.move("up", 2)
        if keys[pygame.K_s]:
            self.move("down", 2)
        if keys[pygame.K_a]:
            self.move("left", 2)
        if keys[pygame.K_d]:
            self.move("right", 2)

    def move(self, direction, amount):
        global xOff, yOff

        if amount:
            amt = amount
        else:
            amt = 2
        if backgroundMap[floor(self.location.y)*80+floor(self.location.x)] == 2:
            print("water")
            amt /= 2

        if direction == "up":
            if self.rect.top < 10:
                yOff += amt/16
            else:
                self.rect.y -= amt
            self.location.y -= amt/16
        if direction == "down":
            if self.rect.bottom > 90:
                yOff -= amt/16
            else:
                self.rect.y += amt
            self.location.y += amt/16
        if direction == "left":
            if self.rect.left < 10:
                xOff += amt/16
            else:
                self.rect.x -= amt
            self.location.x -= amt/16
        if direction == "right":
            if self.rect.right > 190:
                xOff -= amt/16
            else:
                self.rect.x += amt
            self.location.x += amt/16
        print(self.location)

    def update(self):
        self.inputs()


player = pygame.sprite.GroupSingle()
player.add(Player())

# IMAGES
waterIMG = pygame.image.load(
    "textures/minecraft/water_placeholder.png").convert()
sandIMG = pygame.image.load("textures/minecraft/sand.png").convert()
grassIMG = pygame.image.load("textures/minecraft/grass_carried.png").convert()

noise = PerlinNoise(octaves=25)
gameMap = []
backgroundMap = []


waterLevel = 105
sandLevel = 125

xOff = 0
yOff = 0
scale = 16

for y in range(80):
    for x in range(80):
        noiseValue = noise([x/200, y/200])
        noiseMapped = mapR(noiseValue, -1, 1, 0, 255)
        gameMap.append(noiseMapped)

# 1=grass 2=water 3=sand
for i in range(len(gameMap)):
    if gameMap[i] < waterLevel:
        backgroundMap.append(2)
    elif gameMap[i] < sandLevel:
        backgroundMap.append(3)
    else:
        backgroundMap.append(1)

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()

    display.fill("Black")

    keys = pygame.key.get_pressed()

    for y in range(80):
        for x in range(80):
            blockVal = backgroundMap[y*80+x]
            if blockVal == 2:
                tile = pygame.transform.scale(waterIMG, (scale, scale))
            elif blockVal == 3:
                tile = pygame.transform.scale(sandIMG, (scale, scale))
            else:
                tile = pygame.transform.scale(grassIMG, (scale, scale))
            display.blit(tile, (scale*(x+xOff), scale*(y+yOff)))

    player.draw(display)
    player.update()

    screen.blit(pygame.transform.scale(
        display, pygame.display.get_window_size()), (0, 0))
    pygame.display.update()
    clock.tick(60)
