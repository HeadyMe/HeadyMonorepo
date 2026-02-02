import pyautogui
import time
import os
import sys
from datetime import datetime

# Define the path for the template image
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')
TEMPLATE_PATH = os.path.join(TEMPLATE_DIR, 'accept_button.png')

def ensure_template_exists():
    if not os.path.exists(TEMPLATE_PATH):
        print(f"\n[!] Template image not found at: {TEMPLATE_PATH}")
        print("\nTo use this tool:")
        print("1. Take a screenshot of the 'Accept and Continue' button (or any button you want to auto-click).")
        print("2. Crop the image to just the button.")
        print(f"3. Save it as 'accept_button.png' in: {TEMPLATE_DIR}")
        print("\n(You can use the Snipping Tool or similar to do this)")
        return False
    return True

def monitor():
    if not ensure_template_exists():
        return

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Monitoring for target button... Press Ctrl+C to stop.")
    print(f"Looking for image: {TEMPLATE_PATH}")
    
    last_click_time = 0
    COOLDOWN = 2 # Seconds between clicks to prevent spamming

    try:
        while True:
            try:
                # confidence=0.8 requires opencv-python to be installed
                location = pyautogui.locateCenterOnScreen(TEMPLATE_PATH, confidence=0.8, grayscale=True)
                
                if location:
                    current_time = time.time()
                    if current_time - last_click_time > COOLDOWN:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] Found button at {location}. Clicking...")
                        
                        # Store current mouse position to restore it if needed, 
                        # but usually just clicking is fine. 
                        # We might want to be less intrusive, but for "Accept" dialogs, moving mouse is usually necessary.
                        pyautogui.click(location)
                        
                        # Move mouse away slightly so the tooltip/hover doesn't obscure it for the next check if it persists? 
                        # Or just wait.
                        last_click_time = current_time
                
                time.sleep(0.5)
                
            except pyautogui.ImageNotFoundException:
                # This is normal if button is not on screen
                time.sleep(0.5)
            except Exception as e:
                # Sometimes locateCenterOnScreen raises generic exceptions or other cv2 errors
                if "ImageNotFoundException" not in str(type(e)):
                     # Only print if it's not the "not found" error (which is expected)
                     # Note: older pyautogui versions might just return None, newer raise ImageNotFoundException
                     pass
                time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nStopping monitor.")

if __name__ == "__main__":
    monitor()
