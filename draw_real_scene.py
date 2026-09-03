"""
Spider-Man & Mary Jane (2002) - Queensboro Bridge Rescue
========================================================
A multi-color Python Turtle animation drawing the iconic 2002 movie climax:
Spider-Man (Tobey Maguire) rescuing Mary Jane Watson (Kirsten Dunst) from the Queensboro Bridge.

Stages:
    Stage 1: Queensboro Bridge Suspension Cables & Granite Tower Arch
    Stage 2: Roosevelt Island Tramway & Distant Manhattan Skyline
    Stage 3: Spider-Man (Tobey Maguire 2002 Suit: Red & Navy, Silver Webs, Sharp Eyes)
    Stage 4: Taut Tensile Silk Web Line
    Stage 5: Mary Jane Watson (Auburn-Red Flowing Hair, Black Coat, Reaching Arms)
    Stage 6: Bridge Amber Lighting, East River Reflections & Atmospheric Mist

Controls:
    [Up / Down]  : Speed up / slow down drawing
    [Space]      : Finish drawing instantly
    [Esc / q]    : Quit
"""

import turtle
import math
import time
import sys

WIDTH = 640
HEIGHT = 920

def setup_screen():
    screen = turtle.Screen()
    screen.setup(width=WIDTH, height=HEIGHT)
    screen.title("Python Turtle - Spider-Man & Mary Jane (2002) Bridge Rescue")
    screen.bgcolor("#070b16") # Night Sky over East River
    screen.tracer(0)
    return screen

def draw_bridge_structure(t, delay_fn):
    """Stage 1: Draws Queensboro Bridge suspension cables and granite gothic arch."""
    t.pensize(2)
    
    # Left Granite Tower Arch
    t.color("#232936", "#141924")
    t.penup()
    t.goto(-320, 420)
    t.pendown()
    t.begin_fill()
    t.goto(-180, 420)
    t.goto(-180, -440)
    t.goto(-320, -440)
    t.goto(-320, 420)
    t.end_fill()
    delay_fn()

    # Gothic arch cutout in tower
    t.color("#070b16", "#070b16")
    t.penup()
    t.goto(-290, 100)
    t.pendown()
    t.begin_fill()
    t.goto(-210, 100)
    t.goto(-210, 280)
    t.goto(-250, 330) # Arch point
    t.goto(-290, 280)
    t.goto(-290, 100)
    t.end_fill()
    delay_fn()

    # Main Suspension Cable (Heavy steel parabola)
    t.pensize(5)
    t.color("#475569")
    t.penup()
    t.goto(-320, 320)
    t.pendown()
    for x in range(-320, 330, 20):
        # Parabola
        y = int(120 + 200 * ((x - 20) / 300) ** 2)
        t.goto(x, y)
        delay_fn(0.001)

    t.pensize(2)
    t.color("#94a3b8")
    t.penup()
    t.goto(-320, 320)
    t.pendown()
    for x in range(-320, 330, 20):
        y = int(120 + 200 * ((x - 20) / 300) ** 2)
        t.goto(x, y)

    # Vertical Hanger Cables
    t.pensize(1)
    t.color("#334155")
    for x in range(-280, 300, 40):
        y_top = int(120 + 200 * ((x - 20) / 300) ** 2)
        t.penup()
        t.goto(x, y_top)
        t.pendown()
        t.goto(x, -250)
        delay_fn(0.002)

def draw_skyline_and_tram(t, delay_fn):
    """Stage 2: Draws Manhattan skyline bokeh and Roosevelt Island tramway."""
    # Distant Manhattan Buildings & Windows
    buildings = [
        (-160, -250, 45, 180),
        (-100, -250, 60, 240),
        (-25, -250, 50, 200),
        (40, -250, 55, 260),
        (110, -250, 45, 170),
        (170, -250, 70, 220)
    ]
    t.color("#0f172a", "#0a0f1d")
    for bx, by, bw, bh in buildings:
        t.penup()
        t.goto(bx, by)
        t.pendown()
        t.begin_fill()
        t.goto(bx + bw, by)
        t.goto(bx + bw, by + bh)
        t.goto(bx, by + bh)
        t.goto(bx, by)
        t.end_fill()

    # Glowing Yellow Windows in City
    t.color("#fef08a")
    for _ in range(40):
        wx = (-150 + (_ * 11) % 350)
        wy = -220 + (_ * 17) % 200
        t.penup()
        t.goto(wx, wy)
        t.dot(3)
        delay_fn(0.001)

    # Roosevelt Island Tramway Cable
    t.pensize(2)
    t.color("#64748b")
    t.penup()
    t.goto(-320, -60)
    t.pendown()
    t.goto(320, 40)

    # Red Tram Car
    t.color("#991b1b", "#dc2626")
    t.penup()
    t.goto(180, 15)
    t.pendown()
    t.begin_fill()
    t.goto(250, 25)
    t.goto(250, -25)
    t.goto(180, -35)
    t.goto(180, 15)
    t.end_fill()
    delay_fn()

def draw_spiderman(t, delay_fn):
    """Stage 3: Draws Spider-Man (Tobey Maguire 2002 suit: red & navy blue, silver webs, sharp eyes)."""
    sx, sy = 20, 250 # Spider-Man anchor position

    # Upper web line to bridge cable
    t.pensize(3)
    t.color("#ffffff")
    t.penup()
    t.goto(sx - 10, 330)
    t.pendown()
    t.goto(sx - 10, sy + 70)

    # Inverted Acrobat Legs (Navy Blue Suit)
    t.pensize(1)
    t.color("#172554", "#1e3a8a")
    # Left Leg
    t.penup()
    t.goto(sx - 5, sy + 70)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 35, sy + 55)
    t.goto(sx - 48, sy + 15)
    t.goto(sx - 20, sy + 5)
    t.goto(sx - 8, sy + 35)
    t.end_fill()

    # Right Leg
    t.penup()
    t.goto(sx + 5, sy + 70)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 35, sy + 55)
    t.goto(sx + 48, sy + 15)
    t.goto(sx + 20, sy + 5)
    t.goto(sx + 8, sy + 35)
    t.end_fill()

    # Red Boots
    t.color("#7f1d1d", "#b91c1c")
    t.penup()
    t.goto(sx - 8, sy + 70)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 22, sy + 65)
    t.goto(sx - 30, sy + 50)
    t.goto(sx - 12, sy + 45)
    t.end_fill()

    t.penup()
    t.goto(sx + 8, sy + 70)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 22, sy + 65)
    t.goto(sx + 30, sy + 50)
    t.goto(sx + 12, sy + 45)
    t.end_fill()
    delay_fn()

    # Torso (Classic 2002 Red Chest with Blue Flanks)
    t.color("#172554", "#1e3a8a")
    t.penup()
    t.goto(sx - 24, sy + 10)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 30, sy - 25)
    t.goto(sx - 15, sy - 45)
    t.goto(sx - 8, sy - 40)
    t.goto(sx - 10, sy + 5)
    t.end_fill()

    t.penup()
    t.goto(sx + 24, sy + 10)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 30, sy - 25)
    t.goto(sx + 15, sy - 45)
    t.goto(sx + 8, sy - 40)
    t.goto(sx + 10, sy + 5)
    t.end_fill()

    # Red Chest & Abdomen
    t.color("#7f1d1d", "#b91c1c")
    t.penup()
    t.goto(sx - 16, sy + 10)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 16, sy + 10)
    t.goto(sx + 16, sy - 45)
    t.goto(sx - 16, sy - 45)
    t.end_fill()

    # Arms
    # Right arm holding upper web
    t.penup()
    t.goto(sx - 20, sy - 5)
    t.pendown()
    t.begin_fill()
    t.goto(sx - 30, sy + 35)
    t.goto(sx - 10, sy + 70)
    t.goto(sx - 5, sy + 65)
    t.goto(sx - 18, sy + 30)
    t.goto(sx - 12, sy - 5)
    t.end_fill()

    # Left arm reaching down holding/firing lower web
    t.penup()
    t.goto(sx + 18, sy - 5)
    t.pendown()
    t.begin_fill()
    t.goto(sx + 28, sy - 40)
    t.goto(sx + 18, sy - 80) # Wrist
    t.goto(sx + 10, sy - 75)
    t.goto(sx + 18, sy - 35)
    t.goto(sx + 10, sy - 5)
    t.end_fill()
    delay_fn()

    # Head & Mask
    hx, hy = sx - 2, sy - 65
    t.penup()
    t.goto(hx, hy - 25)
    t.pendown()
    t.begin_fill()
    t.circle(25)
    t.end_fill()

    # Raised Silver Webbing pattern
    t.pensize(1)
    t.color("#cbd5e1")
    for a in range(0, 360, 45):
        rad = math.radians(a)
        t.penup()
        t.goto(hx, hy)
        t.pendown()
        t.goto(hx + 23 * math.cos(rad), hy + 23 * math.sin(rad))

    # 2002 Sharp Triangular White Eye Lenses
    t.pensize(2)
    # Left Eye
    t.color("#0f172a", "#ffffff")
    t.penup()
    t.goto(hx - 5, hy - 4)
    t.pendown()
    t.begin_fill()
    t.goto(hx - 16, hy - 12)
    t.goto(hx - 7, hy - 15)
    t.goto(hx - 5, hy - 4)
    t.end_fill()

    # Right Eye
    t.penup()
    t.goto(hx + 5, hy - 4)
    t.pendown()
    t.begin_fill()
    t.goto(hx + 16, hy - 12)
    t.goto(hx + 7, hy - 15)
    t.goto(hx + 5, hy - 4)
    t.end_fill()
    delay_fn()

def draw_web_line(t, delay_fn):
    """Stage 4: Draws the taut tensile white web line extending down to Mary Jane."""
    wx1, wy1 = 38, 170 # Spider-Man's wrist
    wx2, wy2 = 25, -200 # Mary Jane's reaching hand

    t.pensize(4)
    t.color("#bae6fd") # Cyan glow
    t.penup()
    t.goto(wx1, wy1)
    t.pendown()
    t.goto(wx2, wy2)

    t.pensize(2)
    t.color("#ffffff") # Pure white silk
    t.penup()
    t.goto(wx1, wy1)
    t.pendown()
    t.goto(wx2, wy2)
    delay_fn()

def draw_mary_jane(t, delay_fn):
    """Stage 5: Draws Mary Jane Watson (auburn-red hair, black coat, reaching arms, boots)."""
    mx, my = 20, -260

    # 1. Flowing Auburn-Red Hair (Kirsten Dunst's iconic red hair blowing in the wind)
    t.pensize(1)
    t.color("#7c2d12", "#b91c1c")
    hair_curves = [
        [(-25, 30), (-50, 70), (-70, 95), (-35, 60)],
        [(-15, 35), (-25, 80), (-40, 110), (-12, 70)],
        [(15, 35), (25, 80), (40, 105), (12, 65)],
        [(25, 30), (45, 65), (65, 90), (30, 55)]
    ]
    for pts in hair_curves:
        t.penup()
        t.goto(mx + pts[0][0], my + pts[0][1])
        t.pendown()
        t.begin_fill()
        for p in pts[1:]:
            t.goto(mx + p[0], my + p[1])
        t.end_fill()
        delay_fn(0.002)

    # 2. Face & Head
    t.color("#fb923c", "#fed7aa")
    t.penup()
    t.goto(mx, my + 15)
    t.pendown()
    t.begin_fill()
    t.circle(18)
    t.end_fill()
    delay_fn()

    # 3. Iconic Black Trench Coat / Dress
    t.color("#0f172a", "#1e293b")
    t.pensize(2)
    t.penup()
    t.goto(mx - 15, my + 5)
    t.pendown()
    t.begin_fill()
    t.goto(mx + 15, my + 5)
    t.goto(mx + 35, my - 90)
    t.goto(mx - 35, my - 90)
    t.goto(mx - 15, my + 5)
    t.end_fill()
    delay_fn()

    # 4. Outstretched Reaching Arms
    t.pensize(4)
    t.color("#1e293b")
    # Left Arm
    t.penup()
    t.goto(mx - 15, my)
    t.pendown()
    t.goto(mx - 35, my + 50)
    t.color("#fed7aa")
    t.dot(6)

    # Right Arm reaching straight for Spider-Man's web line!
    t.color("#1e293b")
    t.pensize(4)
    t.penup()
    t.goto(mx + 15, my)
    t.pendown()
    t.goto(25, -200) # Web line contact point!
    t.color("#fed7aa")
    t.dot(7)
    delay_fn()

    # 5. Legs & Boots
    t.pensize(6)
    t.color("#0f172a")
    t.penup()
    t.goto(mx - 12, my - 90)
    t.pendown()
    t.goto(mx - 22, my - 160)

    t.penup()
    t.goto(mx + 12, my - 90)
    t.pendown()
    t.goto(mx + 20, my - 155)
    delay_fn()

def draw_bridge_lighting_and_river(t, delay_fn):
    """Stage 6: Draws amber bridge lights, river water ripples, and mist."""
    t.pensize(1)
    
    # Warm Amber Bridge Lights
    amber_lights = [(-280, 220), (-160, 270), (0, 180), (140, 240), (260, 310)]
    for lx, ly in amber_lights:
        t.color("#fef08a")
        t.penup()
        t.goto(lx, ly)
        t.dot(8)
        delay_fn(0.002)

    # East River water ripples at the bottom
    t.color("#1e293b")
    for rx, ry in [(-240, -420), (-100, -430), (50, -415), (180, -425), (-180, -445), (120, -440)]:
        t.penup()
        t.goto(rx, ry)
        t.pendown()
        t.goto(rx + 60, ry)
        delay_fn(0.002)

def main():
    screen = setup_screen()
    t = turtle.Turtle()
    t.hideturtle()
    t.speed(0)

    state = {
        "delay": 0.003,
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
    print("  Spider-Man & Mary Jane (2002) - Queensboro Bridge Rescue")
    print("="*65)
    print("  Drawing the iconic 2002 movie climax step-by-step:")
    print("    [Stage 1] Queensboro Bridge Suspension Cables & Arch")
    print("    [Stage 2] Roosevelt Island Tramway & Manhattan Skyline")
    print("    [Stage 3] Spider-Man (Tobey Maguire 2002 Red & Navy Suit)")
    print("    [Stage 4] Taut Tensile Silk Web Line")
    print("    [Stage 5] Mary Jane Watson (Auburn-Red Hair, Black Coat)")
    print("    [Stage 6] Bridge Lights, East River Water & Mist")
    print("="*65)
    print("  Drawing in progress...")

    draw_bridge_structure(t, delay_fn)
    draw_skyline_and_tram(t, delay_fn)
    draw_spiderman(t, delay_fn)
    draw_web_line(t, delay_fn)
    draw_mary_jane(t, delay_fn)
    draw_bridge_lighting_and_river(t, delay_fn)

    screen.update()
    print("\nScene drawing completed successfully!")
    print("Click on window to exit.")
    screen.exitonclick()

if __name__ == '__main__':
    main()
