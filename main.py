"""
Spider-Man & Gwen Stacy - Slow Step-by-Step Drawing in Python
============================================================
Run:
    python main.py

This script animates Python's Turtle pen slowly sketching out the
iconic silhouette step-by-step before your eyes.

Controls:
    [Up Arrow]   : Speed up drawing
    [Down Arrow] : Slow down drawing
    [Space]      : Fast-forward / instant finish
    [r]          : Restart drawing from beginning
    [Esc / q]    : Quit
"""

import turtle
import os
import sys
import time

# Default step delay in seconds (adjust to make slower or faster)
# 0.015 -> ~32 seconds (very slow and cinematic)
# 0.008 -> ~17 seconds (balanced, smooth step-by-step) [Default]
# 0.002 -> ~4 seconds (fast)
DEFAULT_STEP_DELAY = 0.008

# Check if OpenCV is available
try:
    import cv2
    HAVE_CV2 = True
except ImportError:
    HAVE_CV2 = False

# Try importing pre-extracted vector data as standalone fallback
try:
    from contours_data import CANVAS_WIDTH, CANVAS_HEIGHT, CONTOURS
    HAVE_DATA = True
except ImportError:
    HAVE_DATA = False

def get_contours_from_opencv():
    """Extracts boundary contours dynamically from the image using OpenCV."""
    image_path = 'spiderman.png'
    if not os.path.exists(image_path):
        image_path = 'spiderman.jpg'

    if not os.path.exists(image_path):
        return None, 1000, 750

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None, 1000, 750

    height, width = img.shape
    _, thresh = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
    raw_contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

    valid_contours = [c for c in raw_contours if cv2.contourArea(c) > 20]
    valid_contours.sort(key=cv2.contourArea, reverse=True)

    contours_pts = []
    for cnt in valid_contours:
        pts = []
        for pt in cnt:
            x, y = pt[0]
            tx = int(x - width // 2)
            ty = int(height // 2 - y)
            pts.append((tx, ty))
        contours_pts.append(pts)

    return contours_pts, width, height

def run_drawing():
    width, height = 1000, 760
    contours = None

    if HAVE_CV2 and os.path.exists('spiderman.png'):
        print("[Mode: OpenCV cv2.CHAIN_APPROX_NONE dynamic contour extraction]")
        contours, width, height = get_contours_from_opencv()

    if not contours and HAVE_DATA:
        print("[Mode: Standalone Python Turtle (0 external dependencies)]")
        contours = CONTOURS
        width, height = CANVAS_WIDTH, CANVAS_HEIGHT

    if not contours:
        print("Error: Could not find image or contour data to draw.")
        return

    screen = turtle.Screen()
    screen.setup(width=max(width, 1000), height=max(height, 760))
    screen.title("Python Turtle Graphics - Spider-Man & Gwen Stacy (Step-by-Step)")
    screen.bgcolor("white")

    # Precise frame-by-frame control for slowly running animation
    screen.tracer(0)

    t = turtle.Turtle()
    t.shape("classic")
    t.pensize(2)
    t.showturtle()

    # Animation state
    state = {
        "delay": DEFAULT_STEP_DELAY,
        "running": True,
        "restart": False
    }

    def speed_up():
        state["delay"] = max(0.001, state["delay"] * 0.5)
        print(f"Speed increased -> Step delay: {state['delay']:.4f}s")

    def slow_down():
        state["delay"] = min(0.06, state["delay"] * 1.5)
        print(f"Speed decreased -> Step delay: {state['delay']:.4f}s")

    def fast_forward():
        state["delay"] = 0
        print("Fast-forwarding to completion...")

    def restart_drawing():
        state["restart"] = True
        state["running"] = False

    def close_app():
        state["running"] = False
        turtle.bye()
        sys.exit(0)

    screen.listen()
    screen.onkey(speed_up, "Up")
    screen.onkey(slow_down, "Down")
    screen.onkey(fast_forward, "space")
    screen.onkey(restart_drawing, "r")
    screen.onkey(close_app, "Escape")
    screen.onkey(close_app, "q")

    print("\n" + "="*65)
    print("  Spider-Man & Gwen Stacy - Step-by-Step Turtle Drawing")
    print("="*65)
    print("  Controls:")
    print("    [Up Arrow]   : Speed up drawing")
    print("    [Down Arrow] : Slow down drawing")
    print("    [Space]      : Fast-forward / complete immediately")
    print("    [r]          : Restart from beginning")
    print("    [Esc / q]    : Quit")
    print("="*65 + "\n")
    print("Drawing step-by-step...")

    # Draw each contour slowly step-by-step
    for idx, pts in enumerate(contours):
        if not state["running"]:
            break

        is_outer = (idx == 0)
        color = "black" if is_outer else "white"
        t.color(color)
        t.fillcolor(color)

        t.penup()
        for i, (tx, ty) in enumerate(pts):
            if not state["running"]:
                break

            t.goto(tx, ty)
            if i == 0:
                t.pendown()
                t.begin_fill()

            # Render step-by-step
            screen.update()
            if state["delay"] > 0:
                time.sleep(state["delay"])

        t.end_fill()
        screen.update()

    if state["restart"]:
        t.clear()
        return run_drawing()

    t.hideturtle()
    screen.update()
    print("\nDone! Artwork completed.")
    print("Click on the window to exit.")

    screen.exitonclick()

def main():
    run_drawing()

if __name__ == "__main__":
    main()
