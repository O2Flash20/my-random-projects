from random import randint
import pyautogui
import time

while True:
    direction = ["up", "down", "left", "right"][randint(0, 3)]

    pyautogui.keyDown(direction)
    # time.sleep(randint(2, 20)/10)
    time.sleep(randint(1, 5)/1000)
    pyautogui.keyUp(direction)

    time.sleep(randint(3, 60))