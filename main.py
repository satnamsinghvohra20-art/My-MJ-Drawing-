"""
Spider-Man & Gwen Stacy - Advanced Step-by-Step Drawing in Python
================================================================
An enhanced, cinematic Python Turtle animation of Spider-Man and Gwen Stacy.

Advanced Features:
    - Cinematic Clocktower / Moon Halo backdrop option
    - Spider-Man White Mask Eyes highlight
    - Multi-strand woven web line detailing
    - Real-time terminal progress bar with coordinate telemetry
    - Interactive live speed controls and visual toggles

Controls:
    [Up Arrow]   : Speed up drawing
    [Down Arrow] : Slow down drawing
    [Space]      : Fast-forward / complete instantly
    [e]          : Toggle Spider-Man Mask Eyes
    [b]          : Toggle Clocktower Background
    [r]          : Restart drawing from beginning
    [Esc / q]    : Quit
"""

import turtle
import os
import sys
import time
import math

# Default step delay in seconds (adjust to make slower or faster)
# 0.015 -> ~32s (Cinematic slow) | 0.008 -> ~17s (Smooth) | 0.002 -> ~4s (Fast)
DEFAULT_STEP_DELAY = 0.008

# Check for OpenCV
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
        return None, 1000, 760

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None, 1000, 760

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

def draw_clocktower_background(t):
    """Draws a subtle, atmospheric clocktower / moonlight halo in the background."""
    t.penup()
    t.pensize(1)
    
    # Outer Moonlight Halo
    t.goto(0, -320)
    t.setheading(0)
    t.color("#f1f5f9", "#ffffff")
    t.pendown()
    t.circle(320)
    t.penup()

    # Concentric Clock Ring
    t.color("#e2e8f0")
    t.goto(0, -300)
    t.pendown()
    t.circle(300)
    t.penup()

    # Subtle Roman numeral tick marks around the clock
    for i in range(12):
        angle = i * (360 / 12)
        rad = math.radians(angle)
        x1 = 285 * math.sin(rad)
        y1 = 285 * math.cos(rad)
        x2 = 298 * math.sin(rad)
        y2 = 298 * math.cos(rad)
        t.goto(x1, y1)
        t.pendown()
        t.goto(x2, y2)
        t.penup()

def draw_spider_eyes(t):
    """Draws Spider-Man's iconic curved white mask eye lenses."""
    head_x, head_y = -10, 142
    
    t.penup()
    t.pensize(1)
    t.color("black", "white")

    # Left Eye
    t.goto(head_x - 17, head_y - 2)
    t.pendown()
    t.begin_fill()
    t.goto(head_x - 23, head_y + 4)
    t.goto(head_x - 13, head_y + 6)
    t.goto(head_x - 17, head_y - 2)
    t.end_fill()
    t.penup()

    # Right Eye
    t.goto(head_x - 7, head_y - 2)
    t.pendown()
    t.begin_fill()
    t.goto(head_x - 1, head_y + 4)
    t.goto(head_x - 11, head_y + 6)
    t.goto(head_x - 7, head_y - 2)
    t.end_fill()
    t.penup()

def print_progress(current, total, tx, ty, delay):
    """Prints a sleek in-place progress bar in the terminal."""
    pct = (current / total) * 100
    bar_length = 30
    filled = int(bar_length * current // total)
    bar = "=" * filled + ">" + " " * (bar_length - filled - 1) if filled < bar_length else "=" * bar_length
    speed_label = f"delay: {delay:.3f}s" if delay > 0 else "INSTANT"
    sys.stdout.write(f"\r  [{bar}] {pct:5.1f}% | Point {current:4d}/{total} | ({tx:4d}, {ty:4d}) | {speed_label}")
    sys.stdout.flush()

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
    screen.title("Python Turtle Graphics - Spider-Man & Gwen Stacy (Cinematic)")
    screen.bgcolor("white")

    # Precise frame-by-frame control
    screen.tracer(0)

    t = turtle.Turtle()
    t.shape("classic")
    t.pensize(2)
    t.showturtle()

    # Animation state
    state = {
        "delay": DEFAULT_STEP_DELAY,
        "running": True,
        "restart": False,
        "show_bg": True,
        "show_eyes": True
    }

    def speed_up():
        state["delay"] = max(0.001, state["delay"] * 0.5)

    def slow_down():
        state["delay"] = min(0.06, state["delay"] * 1.5)

    def fast_forward():
        state["delay"] = 0

    def toggle_eyes():
        state["show_eyes"] = not state["show_eyes"]

    def toggle_bg():
        state["show_bg"] = not state["show_bg"]

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
    screen.onkey(toggle_eyes, "e")
    screen.onkey(toggle_bg, "b")
    screen.onkey(restart_drawing, "r")
    screen.onkey(close_app, "Escape")
    screen.onkey(close_app, "q")

    print("\n" + "="*65)
    print("  Spider-Man & Gwen Stacy - Advanced Step-by-Step Drawing")
    print("="*65)
    print("  Controls:")
    print("    [Up / Down]  : Speed up / slow down")
    print("    [Space]      : Fast-forward (finish instantly)")
    print("    [e]          : Toggle Mask Eyes")
    print("    [b]          : Toggle Clocktower Background")
    print("    [r]          : Restart from beginning")
    print("    [Esc / q]    : Quit")
    print("="*65 + "\n")

    # 1. Background Clocktower Halo
    if state["show_bg"]:
        draw_clocktower_background(t)
        screen.update()

    # 2. Draw Silhouette Contours
    total_pts = sum(len(c) for c in contours)
    drawn_pts = 0

    t.color("black", "black")
    t.pensize(2)

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

            drawn_pts += 1
            if drawn_pts % 2 == 0 or state["delay"] == 0:
                print_progress(drawn_pts, total_pts, tx, ty, state["delay"])

            # Render step-by-step
            screen.update()
            if state["delay"] > 0:
                time.sleep(state["delay"])

        t.end_fill()
        screen.update()

    # 3. Spider-Man Eye Highlights
    if state["running"] and state["show_eyes"]:
        draw_spider_eyes(t)
        screen.update()

    if state["restart"]:
        t.clear()
        return run_drawing()

    t.hideturtle()
    screen.update()
    print("\n\nDone! Artwork completed successfully.")
    print("Click on the window to exit.")

    screen.exitonclick()

def main():
    run_drawing()

if __name__ == "__main__":
    main()
