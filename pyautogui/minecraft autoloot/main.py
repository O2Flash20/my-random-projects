import time
import pyautogui

pyautogui.PAUSE = False


def getRight():
    for j in range(8):
        pyautogui.click()
        pyautogui.press("right")
        pyautogui.click()
    pyautogui.press("down")


def getLeft():
    for j in range(8):
        pyautogui.click()
        pyautogui.press("left")
        pyautogui.click()
    pyautogui.press("down")


while True:
    # if pyautogui.locateOnScreen('chest.png') or pyautogui.locateOnScreen('gravestone.png') or pyautogui.locateOnScreen('largeChest.png'):
    if pyautogui.locateOnScreen('chest.png'):
        pyautogui.moveTo(740, 360)
        pyautogui.press("right")
        pyautogui.press("left")

        pyautogui.keyDown('shift')

        if pyautogui.locateOnScreen('chest.png'):
            getRight()
            getLeft()
            getRight()
        else:
            getRight()
            getLeft()
            getRight()
            getLeft()
            getRight()
            getLeft()

        # if pyautogui.locateOnScreen('chest.png'):
        #     i = 1
        # else:
        #     i = 2

        # for k in range(i):
        #     for j in range(8):
        #         pyautogui.click()
        #         pyautogui.press("right")
        #     pyautogui.click()
        #     pyautogui.press("down")

        #     for j in range(8):
        #         pyautogui.click()
        #         pyautogui.press("left")
        #     pyautogui.click()
        #     pyautogui.press("down")

        #     for j in range(8):
        #         pyautogui.click()
        #         pyautogui.press("right")
        #     pyautogui.click()
        #     pyautogui.press("down")

        pyautogui.keyUp('shift')
        pyautogui.press('esc')

        time.sleep(0.5)

    # print(pyautogui.position())
