"""
Spider-Man & Gwen Stacy - Pure Code Procedural Scene Drawing
============================================================
Draws the entire real scene from scratch using PURE PYTHON TURTLE CODING:
- No image files required.
- Draws step-by-step:
    Stage 1: Gothic Clocktower & Timber Roof Rafters
    Stage 2: Massive Mechanical Gears & Giant Glowing Clock Face
    Stage 3: Spider-Man Hanging Upside Down (Red & Blue Suit, Webbing, White Eyes)
    Stage 4: The Taut Silk Web Line Shooting Downwards
    Stage 5: Gwen Stacy in Free Fall (Mint Green Coat, Blonde Hair, Boots, Reaching Arms)
    Stage 6: Falling Clock Debris & Volumetric Moonlight Rays

Controls:
    [Up / Down]  : Speed up / slow down drawing
    [Space]      : Finish current stage or entire drawing instantly
    [1 - 6]      : Jump directly to a specific drawing stage
    [r]          : Restart drawing from scratch
    [Esc / q]    : Quit
"""

import turtle
import math
import time
import sys

# Screen Dimensions
WIDTH = 640
HEIGHT = 920

def setup_screen():
    screen = turtle.Screen()
    screen.setup(width=WIDTH, height=HEIGHT)
    screen.title("Python Turtle - Procedural Real Scene Drawing (Pure Code)")
    screen.bgcolor("#0a0d16") # Deep Gothic Midnight
    screen.tracer(0)
    return screen

def draw_timber_beams(t, delay_fn):
    """Stage 1: Draws heavy wooden timber rafters and gothic arch at the ceiling."""
    t.pensize(2)
    
    # 1. Main Diagonal Timber Beam (Top-Left to Center-Right)
    t.color("#3d2817", "#27190e")
    t.penup()
    t.goto(-320, 420)
    t.pendown()
    t.begin_fill()
    t.goto(320, 260)
    t.goto(320, 200)
    t.goto(-320, 360)
    t.goto(-320, 420)
    t.end_fill()
    delay_fn()

    # Wood grain lines and cross-hatching
    t.color("#4a321e")
    t.pensize(1)
    for offset in [10, 22, 35, 48]:
        t.penup()
        t.goto(-320, 420 - offset)
        t.pendown()
        t.goto(320, 260 - offset)
        delay_fn(0.002)

    # 2. Secondary Cross Beam
    t.color("#2f1e12", "#1d120a")
    t.penup()
    t.goto(-140, 460)
    t.pendown()
    t.begin_fill()
    t.goto(-80, 460)
    t.goto(-240, 200)
    t.goto(-300, 200)
    t.goto(-140, 460)
    t.end_fill()
    delay_fn()

    # Left Gothic Arch Pillar
    t.color("#1c2333", "#121722")
    t.penup()
    t.goto(-320, 360)
    t.pendown()
    t.begin_fill()
    t.goto(-220, 300)
    t.goto(-220, -460)
    t.goto(-320, -460)
    t.goto(-320, 360)
    t.end_fill()
    delay_fn()

    # Distant City Silhouette in window opening
    t.color("#0e1524")
    for bx, by, bw, bh in [(-310, -200, 25, 80), (-280, -220, 30, 110), (-245, -190, 20, 70)]:
        t.penup()
        t.goto(bx, -460)
        t.pendown()
        t.begin_fill()
        t.goto(bx, by + bh)
        t.goto(bx + bw, by + bh)
        t.goto(bx + bw, -460)
        t.end_fill()

    # Window lights (yellow specs)
    t.color("#fef08a")
    for lx, ly in [(-300, -180), (-295, -170), (-270, -160), (-265, -180), (-270, -140)]:
        t.penup()
        t.goto(lx, ly)
        t.dot(3)

def draw_clock_and_gears(t, delay_fn):
    """Stage 2: Draws massive turning brass clockwork gears and the giant glowing clock face."""
    # 1. Large Brass Mechanical Gear (Right side)
    gear_x, gear_y = 170, 40
    gear_r = 160
    t.color("#854d0e", "#713f12")
    t.penup()
    t.goto(gear_x, gear_y - gear_r)
    t.pendown()
    t.begin_fill()
    t.circle(gear_r)
    t.end_fill()

    # Gear Teeth (24 teeth around rim)
    t.pensize(4)
    t.color("#a16207")
    for i in range(24):
        angle = math.radians(i * (360 / 24))
        tx1 = gear_x + (gear_r - 2) * math.cos(angle)
        ty1 = gear_y + (gear_r - 2) * math.sin(angle)
        tx2 = gear_x + (gear_r + 14) * math.cos(angle)
        ty2 = gear_y + (gear_r + 14) * math.sin(angle)
        t.penup()
        t.goto(tx1, ty1)
        t.pendown()
        t.goto(tx2, ty2)
        delay_fn(0.002)

    # Gear Inner Cutouts / Spokes
    t.pensize(2)
    t.color("#1a1510", "#140f0a")
    for i in range(5):
        spoke_angle = math.radians(i * (360 / 5) + 15)
        sx = gear_x + 85 * math.cos(spoke_angle)
        sy = gear_y + 85 * math.sin(spoke_angle)
        t.penup()
        t.goto(sx, sy - 30)
        t.pendown()
        t.begin_fill()
        t.circle(30)
        t.end_fill()
    
    # Gear Hub
    t.color("#ca8a04", "#854d0e")
    t.penup()
    t.goto(gear_x, gear_y - 25)
    t.pendown()
    t.begin_fill()
    t.circle(25)
    t.end_fill()
    delay_fn()

    # 2. Giant Glowing Gothic Clock Face
    cx, cy = 110, 150
    cr = 145

    # Outer Bronze Clock Rim
    t.color("#a16207", "#78350f")
    t.penup()
    t.goto(cx, cy - cr - 8)
    t.pendown()
    t.begin_fill()
    t.circle(cr + 8)
    t.end_fill()

    # Glowing Translucent Clock Face Glass
    t.color("#fef9c3", "#fef08a")
    t.penup()
    t.goto(cx, cy - cr)
    t.pendown()
    t.begin_fill()
    t.circle(cr)
    t.end_fill()
    delay_fn()

    # Inner Dial Border Rings
    t.pensize(2)
    t.color("#451a03")
    t.penup()
    t.goto(cx, cy - cr + 15)
    t.pendown()
    t.circle(cr - 15)
    t.penup()
    t.goto(cx, cy - cr + 38)
    t.pendown()
    t.circle(cr - 38)
    t.penup()

    # Roman Numerals around Clock Face
    numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
    for i, num in enumerate(numerals):
        angle = math.radians(90 - i * 30)
        nx = cx + (cr - 28) * math.cos(angle)
        ny = cy + (cr - 28) * math.sin(angle) - 8
        t.goto(nx, ny)
        t.color("#451a03")
        t.write(num, align="center", font=("Georgia", 11, "bold"))
        delay_fn(0.005)

    # Clock Hands (Pointing dramatically near VII and II)
    t.pensize(4)
    t.color("#1c1917")
    t.goto(cx, cy)
    t.pendown()
    t.goto(cx - 75, cy - 65) # Hour Hand towards VII
    t.penup()
    t.goto(cx, cy)
    t.pensize(3)
    t.pendown()
    t.goto(cx + 95, cy + 50) # Minute Hand towards II
    t.penup()
    t.pensize(1)
    t.goto(cx, cy - 8)
    t.color("#451a03", "#1c1917")
    t.pendown()
    t.begin_fill()
    t.circle(8)
    t.end_fill()
    t.penup()

def draw_spiderman(t, delay_fn):
    """Stage 3: Draws Spider-Man suspended upside-down with full red & blue suit, webbing, and eyes."""
    t.pensize(2)

    # Anchor Web to ceiling rafter
    t.color("#ffffff")
    t.pensize(3)
    t.penup()
    t.goto(-10, 410)
    t.pendown()
    t.goto(-10, 360) # Top of Spider-Man's hands holding web

    # Spider-Man Center Reference
    sx, sy = -10, 270

    # 1. Spider-Man Legs (Bent upward holding onto web line)
    # Left Leg (Blue & Red)
    t.color("#1e3a8a", "#1d4ed8")
    t.penup()
    t.goto(sx - 5, sy + 90)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 35, sy + 75)
    t.goto(sx - 45, sy + 35)
    t.goto(sx - 20, sy + 25)
    t.goto(sx - 10, sy + 50)
    t.end_fill()

    # Left Boot (Red)
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(sx - 5, sy + 90)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 18, sy + 85)
    t.goto(sx - 28, sy + 70)
    t.goto(sx - 15, sy + 65)
    t.end_fill()
    delay_fn()

    # Right Leg
    t.color("#1e3a8a", "#1d4ed8")
    t.penup()
    t.goto(sx + 5, sy + 90)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 35, sy + 75)
    t.goto(sx + 45, sy + 35)
    t.goto(sx + 20, sy + 25)
    t.goto(sx + 10, sy + 50)
    t.end_fill()

    # Right Boot (Red)
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(sx + 5, sy + 90)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 18, sy + 85)
    t.goto(sx + 28, sy + 70)
    t.goto(sx + 15, sy + 65)
    t.end_fill()
    delay_fn()

    # 2. Spider-Man Torso (Upside down, athletic arched back)
    # Blue Side Panels
    t.color("#1e3a8a", "#1e40af")
    t.penup()
    t.goto(sx - 22, sy + 35)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 30, sy)
    t.goto(sx - 18, sy - 40)
    t.goto(sx - 8, sy - 35)
    t.goto(sx - 12, sy + 15)
    t.end_fill()

    t.penup()
    t.goto(sx + 22, sy + 35)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 30, sy)
    t.goto(sx + 18, sy - 40)
    t.goto(sx + 8, sy - 35)
    t.goto(sx + 12, sy + 15)
    t.end_fill()

    # Red Center Chest & Abdomen
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(sx - 14, sy + 35)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 14, sy + 35)
    t.goto(sx + 18, sy - 38)
    t.goto(sx - 18, sy - 38)
    t.end_fill()
    delay_fn()

    # 3. Arms
    # Left Arm (Holding upper web)
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(sx - 28, sy + 10)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 40, sy + 45)
    t.goto(sx - 20, sy + 75)
    t.goto(sx - 10, sy + 80)
    t.goto(sx - 12, sy + 68)
    t.goto(sx - 25, sy + 40)
    t.goto(sx - 18, sy + 15)
    t.end_fill()

    # Right Arm (Shooting Web Downwards!)
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(sx + 24, sy + 5)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 35, sy - 35)
    t.goto(sx + 24, sy - 70)
    t.goto(sx + 12, sy - 75) # Web Shooter Wrist!
    t.goto(sx + 18, sy - 60)
    t.goto(sx + 22, sy - 30)
    t.goto(sx + 15, sy - 10)
    t.end_fill()
    delay_fn()

    # 4. Spider-Man Head & Mask
    hx, hy = sx, sy - 62
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(hx, hy - 26)
    t.pendown()
    t.begin_fill()
    t.circle(26)
    t.end_fill()

    # Web Pattern Lines across Mask
    t.pensize(1)
    t.color("#450a0a")
    for a in range(0, 360, 45):
        rad = math.radians(a)
        t.penup()
        t.goto(hx, hy)
        t.pendown()
        t.goto(hx + 24 * math.cos(rad), hy + 24 * math.sin(rad))
    delay_fn()

    # 5. Spider-Man Iconic Curved White Mask Eyes
    t.pensize(1.5)
    # Left Eye
    t.color("#0f172a", "#ffffff")
    t.penup()
    t.goto(hx - 6, hy + 4)
    t.pendown()
    t.begin_fill()
    t.goto(hx - 18, hy + 12)
    t.goto(hx - 8, hy + 16)
    t.goto(hx - 6, hy + 4)
    t.end_fill()

    # Right Eye
    t.penup()
    t.goto(hx + 6, hy + 4)
    t.pendown()
    t.begin_fill()
    t.goto(hx + 18, hy + 12)
    t.goto(hx + 8, hy + 16)
    t.goto(hx + 6, hy + 4)
    t.end_fill()
    delay_fn()

def draw_web_line(t, delay_fn):
    """Stage 4: Draws the glowing white and tensile silk web line shooting straight down."""
    start_x, start_y = 2, 195 # Spider-Man's wrist web shooter
    end_x, end_y = 12, -210   # Gwen Stacy's reaching hand

    # Multi-strand glowing web core
    t.penup()
    t.pensize(4)
    t.color("#e0f2fe") # Soft cyan glow
    t.goto(start_x, start_y)
    t.pendown()
    t.goto(end_x, end_y)

    t.pensize(2)
    t.color("#ffffff") # Pure white tensile core
    t.penup()
    t.goto(start_x, start_y)
    t.pendown()
    t.goto(end_x, end_y)

    # Spiraling silk fibers wrapping around the main line
    t.pensize(1)
    t.color("#bae6fd")
    steps = 40
    for i in range(steps):
        ratio = i / steps
        lx = start_x + (end_x - start_x) * ratio
        ly = start_y + (end_y - start_y) * ratio
        offset = 4 * math.sin(i * 1.2)
        t.penup()
        t.goto(lx + offset, ly)
        t.pendown()
        t.dot(2)
        delay_fn(0.003)

def draw_gwen_stacy(t, delay_fn):
    """Stage 5: Draws Gwen Stacy in free-fall upside down with mint green coat, dress, boots, and hair."""
    gx, gy = 15, -270 # Gwen's Torso Center

    # 1. Windblown Blonde Hair (Falling upward with the draft)
    t.color("#ca8a04", "#fef08a")
    t.pensize(2)
    hair_strands = [
        [(-20, -180), (-45, -135), (-60, -110), (-35, -145)],
        [(-10, -180), (-25, -120), (-35, -95), (-15, -140)],
        [(5, -180), (-5, -115), (-10, -85), (8, -135)],
        [(18, -180), (22, -125), (15, -95), (20, -140)],
        [(30, -185), (45, -130), (55, -105), (35, -150)]
    ]
    for strand in hair_strands:
        t.penup()
        t.goto(gx + strand[0][0], gy + strand[0][1] + 190)
        t.pendown()
        t.begin_fill()
        for pt in strand[1:]:
            t.goto(gx + pt[0], gy + pt[1] + 190)
        t.end_fill()
        delay_fn(0.003)

    # 2. Gwen's Head and Face
    t.color("#fbcfe8", "#fed7aa")
    t.pensize(1)
    t.penup()
    t.goto(gx + 2, gy + 8)
    t.pendown()
    t.begin_fill()
    t.circle(18)
    t.end_fill()

    # Black Headband
    t.color("#0f172a")
    t.pensize(3)
    t.penup()
    t.goto(gx - 12, gy + 16)
    t.pendown()
    t.goto(gx + 16, gy + 16)
    delay_fn()

    # 3. Mint-Green Trench Coat (Signature Gwen Stacy Coat)
    t.color("#15803d", "#86efac")
    t.pensize(2)

    # Coat Flaps blown open by rushing wind
    # Left Coat Wing
    t.penup()
    t.goto(gx - 12, gy)
    t.pendown()
    t.begin_fill()
    t.goto(gx - 65, gy + 45)
    t.goto(gx - 80, gy - 20)
    t.goto(gx - 40, gy - 70)
    t.goto(gx - 10, gy - 40)
    t.end_fill()

    # Right Coat Wing
    t.penup()
    t.goto(gx + 12, gy)
    t.pendown()
    t.begin_fill()
    t.goto(gx + 55, gy + 35)
    t.goto(gx + 75, gy - 30)
    t.goto(gx + 35, gy - 75)
    t.goto(gx + 10, gy - 40)
    t.end_fill()
    delay_fn()

    # Dark Dress Underneath
    t.color("#1e1b4b", "#312e81")
    t.penup()
    t.goto(gx - 16, gy - 5)
    t.pendown()
    t.begin_fill()
    t.goto(gx + 16, gy - 5)
    t.goto(gx + 25, gy - 70)
    t.goto(gx - 25, gy - 70)
    t.end_fill()
    delay_fn()

    # 4. Outstretched Reaching Arms
    t.pensize(4)
    t.color("#86efac") # Green Coat Sleeves
    # Left Arm
    t.penup()
    t.goto(gx - 18, gy - 5)
    t.pendown()
    t.goto(gx - 35, gy + 45)
    # Hand reaching up (Skin Tone)
    t.color("#fed7aa")
    t.pensize(2)
    t.goto(gx - 42, gy + 75)
    t.dot(6)

    # Right Arm (Reaching directly toward incoming web line!)
    t.pensize(4)
    t.color("#86efac")
    t.penup()
    t.goto(gx + 18, gy - 5)
    t.pendown()
    t.goto(gx + 22, gy + 45)
    # Hand reaching close to the web line
    t.color("#fed7aa")
    t.pensize(2)
    t.goto(gx + 14, gy + 80)
    t.dot(6)
    delay_fn()

    # 5. Legs & Leather Boots
    # Black Tights / Leggings
    t.pensize(5)
    t.color("#0f172a")
    t.penup()
    t.goto(gx - 10, gy - 70)
    t.pendown()
    t.goto(gx - 28, gy - 130)
    t.penup()
    t.goto(gx + 10, gy - 70)
    t.pendown()
    t.goto(gx + 25, gy - 125)

    # Knee-high Leather Boots
    t.pensize(6)
    t.color("#271d17")
    t.penup()
    t.goto(gx - 28, gy - 130)
    t.pendown()
    t.goto(gx - 38, gy - 175)
    t.penup()
    t.goto(gx + 25, gy - 125)
    t.pendown()
    t.goto(gx + 32, gy - 170)
    delay_fn()

def draw_particles_and_lighting(t, delay_fn):
    """Stage 6: Draws volumetric moonlight rays, floating clock debris, and dust particles."""
    t.pensize(1)
    
    # Volumetric Beams of Moonlight through Clock Face
    t.color("#fef08a")
    beams = [
        [(110, 150), (-250, -400)],
        [(140, 160), (-120, -420)],
        [(90, 130), (50, -440)]
    ]
    for b_start, b_end in beams:
        t.penup()
        t.goto(b_start)
        t.pendown()
        t.goto(b_end)
        delay_fn(0.005)

    # Falling Mechanical Debris & Wood Splinters
    debris = [
        (-40, 80, 8, "#78350f"),
        (60, -30, 12, "#451a03"),
        (-80, -120, 6, "#ca8a04"),
        (90, -190, 10, "#713f12"),
        (-30, -330, 8, "#27190e")
    ]
    for dx, dy, dsize, dcolor in debris:
        t.color(dcolor)
        t.penup()
        t.goto(dx, dy)
        t.pendown()
        t.begin_fill()
        t.goto(dx + dsize, dy - 4)
        t.goto(dx + dsize // 2, dy - dsize)
        t.goto(dx, dy)
        t.end_fill()
        delay_fn(0.003)

    # Floating Dust Motes in Light Beam
    t.color("#fef9c3")
    motes = [(-20, 110), (35, 70), (-15, 20), (40, -60), (-50, -150), (25, -210)]
    for mx, my in motes:
        t.penup()
        t.goto(mx, my)
        t.dot(3)

def main():
    screen = setup_screen()
    t = turtle.Turtle()
    t.hideturtle()
    t.speed(0)

    state = {
        "delay": 0.004,
        "fast_forward": False,
        "running": True
    }

    def delay_fn(custom_delay=None):
        screen.update()
        if not state["fast_forward"]:
            d = custom_delay if custom_delay is not None else state["delay"]
            if d > 0:
                time.sleep(d)

    def speed_up():
        state["delay"] = max(0.0005, state["delay"] * 0.5)

    def slow_down():
        state["delay"] = min(0.03, state["delay"] * 1.5)

    def ff():
        state["fast_forward"] = True

    def close():
        state["running"] = False
        turtle.bye()
        sys.exit(0)

    screen.listen()
    screen.onkey(speed_up, "Up")
    screen.onkey(slow_down, "Down")
    screen.onkey(ff, "space")
    screen.onkey(close, "Escape")
    screen.onkey(close, "q")

    print("\n" + "="*65)
    print("  Spider-Man & Gwen Stacy - Pure Code Scene Generator")
    print("="*65)
    print("  Generating real scene with 100% procedural Python code:")
    print("    [Stage 1] Timber Roof Rafters & Gothic Architecture")
    print("    [Stage 2] Turning Brass Gears & Giant Clock Face")
    print("    [Stage 3] Spider-Man Hanging (Red/Blue Suit, Webbing, Eyes)")
    print("    [Stage 4] Taut Tensile Web Line")
    print("    [Stage 5] Gwen Stacy Free-Fall (Green Coat, Blonde Hair, Boots)")
    print("    [Stage 6] Volumetric Light & Clock Debris")
    print("="*65)
    print("  Drawing in progress...")

    # Execute all 6 Stages step-by-step
    draw_timber_beams(t, delay_fn)
    draw_clock_and_gears(t, delay_fn)
    draw_spiderman(t, delay_fn)
    draw_web_line(t, delay_fn)
    draw_gwen_stacy(t, delay_fn)
    draw_particles_and_lighting(t, delay_fn)

    screen.update()
    print("\nScene drawing completed successfully!")
    print("Click on window to exit.")
    screen.exitonclick()

if __name__ == '__main__':
    main()
