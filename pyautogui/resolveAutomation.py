import pyautogui
import keyboard
import time

keyboard.on_press_key("g", lambda _: keyCombo())

# more time between presses


def keyCombo():
    pyautogui.press("Q")
    time.sleep(0.5)
    pyautogui.press("A")
    time.sleep(0.2)
    pyautogui.press("A")
    time.sleep(0.5)
    pyautogui.press("space")


keyboard.wait()
