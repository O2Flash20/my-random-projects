import pygame

pygame.init()
screen = pygame.display.set_mode((1920, 1036),  pygame.RESIZABLE)
pygame.display.set_caption("Particle System Test")
clock = pygame.time.Clock()

display = pygame.Surface((10, 10))

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()
    screen.fill("Blue")


    display.fill("White")
    pygame.draw.circle(display, "Red", (2, 4), 3)
    screen.blit(pygame.transform.scale(display, pygame.display.get_window_size()), (0, 0))

    pygame.display.update()
    clock.tick(60)