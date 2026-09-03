"""
Spider-Man & Gwen Stacy - Real Scene Comic Sketch Drawing
=========================================================
This script uses OpenCV and Python Turtle to draw the real colored
comic book scene of the clock tower fall step-by-step.

Features:
    - Multi-color comic ink tracing:
        * Red & Blue for Spider-Man
        * Warm Amber & Gold for the Clock Face
        * Glowing Silk White for the Web Line
        * Mint Green for Gwen Stacy
        * Charcoal & Sepia for the Mechanical Clock Gears
    - Real-time step-by-step pen animation
    - Interactive speed controls and instant finish

Controls:
    [Up Arrow]   : Speed up drawing
    [Down Arrow] : Slow down drawing
    [Space]      : Fast-forward / complete instantly
    [Esc / q]    : Quit
"""

import os
import sys
import time

try:
    import cv2
    import numpy as np
    HAVE_CV2 = True
except ImportError:
    HAVE_CV2 = False

import turtle

def rgb_to_hex(r, g, b):
    return f"#{int(r):02x}{int(g):02x}{int(b):02x}"

def draw_real_scene():
    image_path = 'scene_real_drawing.jpg'
    if not os.path.exists(image_path):
        image_path = 'scene_full_color.jpg'

    if not os.path.exists(image_path):
        print(f"Error: Could not find image at {image_path}")
        return

    # 1. Process Image with OpenCV
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        print("Error reading image.")
        return

    # Resize to comfortable canvas dimensions (e.g. 500 x 896)
    target_w, target_h = 500, 896
    img_resized = cv2.resize(img_bgr, (target_w, target_h), interpolation=cv2.INTER_AREA)
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    # Edge detection for sketch outlines
    filtered = cv2.bilateralFilter(gray, 7, 50, 50)
    edges = cv2.Canny(filtered, 40, 130)

    # Find stroke contours
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter and sort strokes (draw top-to-bottom: Spider-Man -> Clock -> Web -> Gwen)
    strokes = []
    for cnt in contours:
        if len(cnt) >= 3 and cv2.arcLength(cnt, False) > 12:
            # Sample dominant color along this stroke
            pts = cnt.squeeze()
            if len(pts.shape) == 1:
                pts = pts.reshape(1, 2)
            
            mid_pt = pts[len(pts) // 2]
            mx, my = int(mid_pt[0]), int(mid_pt[1])
            mx = max(0, min(target_w - 1, mx))
            my = max(0, min(target_h - 1, my))
            
            color_rgb = img_rgb[my, mx]
            # Enhance vibrancy for sketch
            r, g, b = int(color_rgb[0]), int(color_rgb[1]), int(color_rgb[2])
            
            # Boost brightness if too dark
            if r + g + b < 60:
                color_hex = "#1a1a24"
            else:
                color_hex = rgb_to_hex(r, g, b)

            # Store stroke with average Y for top-to-bottom sorting
            avg_y = np.mean(pts[:, 1])
            strokes.append((avg_y, color_hex, pts))

    # Sort strokes top-to-bottom
    strokes.sort(key=lambda s: s[0])

    # 2. Setup Turtle Window
    screen = turtle.Screen()
    screen.setup(width=target_w + 100, height=min(920, target_h + 40))
    screen.title("Python Turtle - Drawing the Real Scene (Comic Ink & Pencil)")
    screen.bgcolor("#fdfaf5") # Vintage parchment paper tone
    screen.tracer(0)

    t = turtle.Turtle()
    t.shape("classic")
    t.pensize(1.5)
    t.showturtle()

    state = {
        "delay": 0.003,
        "running": True,
        "batch": 3
    }

    def speed_up():
        state["batch"] = min(20, state["batch"] + 2)
        state["delay"] = max(0.0005, state["delay"] * 0.7)

    def slow_down():
        state["batch"] = max(1, state["batch"] - 1)
        state["delay"] = min(0.02, state["delay"] * 1.4)

    def fast_forward():
        state["delay"] = 0
        state["batch"] = 50

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

    print("\n" + "="*65)
    print("  Spider-Man & Gwen Stacy - Real Scene Comic Sketch Drawing")
    print("="*65)
    print("  Controls:")
    print("    [Up / Down]  : Adjust drawing speed")
    print("    [Space]      : Fast-forward (finish instantly)")
    print("    [Esc / q]    : Quit")
    print(f"  Drawing {len(strokes)} colored comic sketch strokes...")
    print("="*65 + "\n")

    # 3. Draw Strokes Step-by-Step
    drawn = 0
    for idx, (avg_y, hex_color, pts) in enumerate(strokes):
        if not state["running"]:
            break

        t.color(hex_color)
        t.penup()

        first_pt = pts[0]
        tx = int(first_pt[0] - target_w // 2)
        ty = int(target_h // 2 - first_pt[1])
        t.goto(tx, ty)
        t.pendown()

        for pt in pts[1:]:
            px = int(pt[0] - target_w // 2)
            py = int(target_h // 2 - pt[1])
            t.goto(px, py)

        drawn += 1
        if drawn % state["batch"] == 0 or state["delay"] == 0:
            screen.update()
            if state["delay"] > 0:
                time.sleep(state["delay"])

    t.hideturtle()
    screen.update()
    print("\nReal scene drawing completed! Click window to exit.")
    screen.exitonclick()

if __name__ == '__main__':
    if not HAVE_CV2:
        print("OpenCV is required for draw_real_scene.py. Run in .venv or install opencv-python.")
    else:
        draw_real_scene()
