"""
Spider-Man & Gwen Stacy Drawing using Python Turtle & OpenCV (cv2)
==================================================================
This script loads the silhouette image, extracts the boundary contours
using OpenCV (cv2.CHAIN_APPROX_NONE), and animates the drawing slowly
step-by-step using Python's Turtle graphics.
"""

import cv2
import turtle
import os
import time
import sys

# Animation speed configuration:
# Change STEP_DELAY to adjust how slowly it draws:
#   0.015 -> Slow & cinematic (~32 seconds)
#   0.008 -> Smooth step-by-step (~17 seconds) [Default]
#   0.003 -> Fast (~6 seconds)
STEP_DELAY = 0.008

def draw_spiderman():
    # 1. Check for image or fallback to precomputed pure vector contours
    image_path = 'spiderman.png' if os.path.exists('spiderman.png') else ('spiderman.jpg' if os.path.exists('spiderman.jpg') else None)
    
    contours_pts = []
    width, height = 1000, 760

    if image_path and os.path.exists(image_path):
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            height, width = img.shape
            _, thresh = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
            valid_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > 20]
            valid_contours.sort(key=cv2.contourArea, reverse=True)
            for cnt in valid_contours:
                pts = [(int(p[0][0] - width // 2), int(height // 2 - p[0][1])) for p in cnt]
                contours_pts.append(pts)

    if not contours_pts:
        try:
            from contours_data import CONTOURS, CANVAS_WIDTH, CANVAS_HEIGHT
            contours_pts = CONTOURS
            width, height = CANVAS_WIDTH, CANVAS_HEIGHT
        except ImportError:
            raise FileNotFoundError("Could not find image or vector contour data.")

    # 4. Set up Turtle Window
    screen = turtle.Screen()
    screen.setup(width=1000, height=760)
    screen.title("Python Turtle Graphics - Spider-Man & Gwen Stacy (Step-by-Step)")
    screen.bgcolor("white")
    
    # We use manual updates (tracer 0) to guarantee precise, smooth step-by-step rendering
    screen.tracer(0)

    t = turtle.Turtle()
    t.shape("classic")   # Classic arrow pen cursor
    t.pensize(2)
    t.showturtle()

    # Speed control state
    state = {"delay": STEP_DELAY, "running": True}

    def speed_up():
        state["delay"] = max(0.001, state["delay"] * 0.5)
        print(f"Speed increased (delay: {state['delay']:.4f}s)")

    def slow_down():
        state["delay"] = min(0.05, state["delay"] * 1.5)
        print(f"Speed decreased (delay: {state['delay']:.4f}s)")

    def fast_forward():
        state["delay"] = 0
        print("Fast-forwarding to completion...")

    def close_app():
        state["running"] = False
        turtle.bye()
        sys.exit(0)

    screen.listen()
    screen.onkey(speed_up, "Up")
    screen.onkey(slow_down, "Down")
    screen.onkey(fast_forward, "space")
    screen.onkey(close_app, "Escape")
    screen.onkey(close_app, "q")

    print("\n" + "="*60)
    print("  Spider-Man & Gwen Stacy - Slow Step-by-Step Drawing")
    print("="*60)
    print("  Controls:")
    print("    [Up Arrow]   : Draw faster")
    print("    [Down Arrow] : Draw slower")
    print("    [Space]      : Fast-forward (finish instantly)")
    print("    [Esc / q]    : Quit")
    print("="*60 + "\n")
    print("Drawing in progress...")

    # 5. Draw each contour slowly step-by-step
    for idx, cnt in enumerate(valid_contours):
        if not state["running"]:
            break

        is_outer = (idx == 0)
        color = "black" if is_outer else "white"
        t.color(color)
        t.fillcolor(color)

        t.penup()
        for i, pt in enumerate(cnt):
            if not state["running"]:
                break

            x, y = pt[0]
            # Convert image coordinates (top-left origin) to Turtle coordinates (center origin)
            turtle_x = x - (width // 2)
            turtle_y = (height // 2) - y

            t.goto(turtle_x, turtle_y)
            if i == 0:
                t.pendown()
                t.begin_fill()

            # Render step-by-step
            screen.update()
            if state["delay"] > 0:
                time.sleep(state["delay"])

        t.end_fill()
        screen.update()

    t.hideturtle()
    screen.update()
    print("\nDrawing completed successfully!")
    print("Click on the window to exit.")
    
    screen.exitonclick()

if __name__ == "__main__":
    draw_spiderman()
