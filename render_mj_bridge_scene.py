"""
Render the Spider-Man & Mary Jane (2002) Bridge Rescue Scene
============================================================
Generates a high-resolution cinematic artwork of the iconic 2002
Queensboro Bridge climax with Spider-Man (Tobey Maguire) and Mary Jane (Kirsten Dunst).
"""

import cv2
import numpy as np
import math

def render_scene():
    width = 1080
    height = 1920
    canvas = np.zeros((height, width, 3), dtype=np.uint8)

    # 1. Background Sky & River Gradient (Deep Gothic Midnight Blue)
    for y in range(height):
        ratio = y / height
        # Night sky to dark East river
        if ratio < 0.7:
            r = int(6 + ratio * 15)
            g = int(10 + ratio * 20)
            b = int(22 + ratio * 35)
        else:
            # River reflection zone
            r = int(12 + (1 - ratio) * 20)
            g = int(18 + (1 - ratio) * 25)
            b = int(35 + (1 - ratio) * 40)
        canvas[y, :] = [b, g, r] # BGR

    # 2. Distant Manhattan Skyline Lights & Bokeh (y: 1100 to 1400)
    np.random.seed(42)
    # City building silhouettes
    bx = 0
    while bx < width:
        bw = np.random.randint(40, 100)
        bh = np.random.randint(180, 420)
        by = 1350 - bh
        cv2.rectangle(canvas, (bx, by), (bx + bw, 1450), (18, 14, 10), -1)
        # Windows
        for wy in range(by + 20, 1350, 25):
            for wx in range(bx + 8, bx + bw - 8, 16):
                if np.random.rand() > 0.35:
                    col = (np.random.randint(140, 220), np.random.randint(200, 255), np.random.randint(230, 255))
                    cv2.rectangle(canvas, (wx, wy), (wx + 8, wy + 14), col, -1)
        bx += bw + np.random.randint(5, 20)

    # River water reflections (soft blur)
    water_overlay = canvas[1350:height, :].copy()
    water_overlay = cv2.GaussianBlur(water_overlay, (21, 21), 0)
    canvas[1350:height, :] = cv2.addWeighted(canvas[1350:height, :], 0.4, water_overlay, 0.6, 0)

    # 3. Queensboro Bridge Suspension Cables & Trusses
    # Granite Tower Arch in distance
    tower_pts = np.array([[80, 200], [280, 200], [240, 1500], [120, 1500]], np.int32)
    cv2.fillPoly(canvas, [tower_pts], (28, 24, 20))
    cv2.polylines(canvas, [tower_pts], True, (45, 38, 32), 3)

    # Heavy steel main suspension cable (curving across upper frame)
    cable_pts = []
    for x in range(0, width, 10):
        # Parabola curve
        y = int(320 + 260 * ((x - width * 0.4) / (width * 0.5)) ** 2)
        cable_pts.append((x, y))
    for i in range(len(cable_pts) - 1):
        cv2.line(canvas, cable_pts[i], cable_pts[i+1], (60, 50, 40), 12)
        cv2.line(canvas, cable_pts[i], cable_pts[i+1], (120, 105, 90), 4)

    # Vertical bridge hanger ropes
    for x in range(120, width - 80, 75):
        y_top = int(320 + 260 * ((x - width * 0.4) / (width * 0.5)) ** 2)
        cv2.line(canvas, (x, y_top), (x, 1400), (45, 38, 30), 2)

    # Roosevelt Island Tramway Cable crossing diagonally
    cv2.line(canvas, (0, 750), (width, 1050), (70, 60, 50), 4)
    # Red Tram Car in distance
    cv2.rectangle(canvas, (820, 960), (940, 1040), (25, 25, 140), -1) # Red Tram in BGR
    cv2.rectangle(canvas, (830, 975), (930, 1000), (220, 240, 250), -1) # Windows

    # 4. Spider-Man (Tobey Maguire 2002) - Hanging at Top (y ≈ 500)
    sx, sy = 540, 520

    # Upper web anchor from bridge cable
    cv2.line(canvas, (sx, 320), (sx - 15, sy - 80), (240, 245, 255), 4)

    # Spider-Man Body (Athletic acrobatic hang)
    # Legs (Cobalt Blue Suit)
    cv2.ellipse(canvas, (sx - 45, sy - 40), (25, 65), -25, 0, 360, (130, 45, 20), -1) # Blue in BGR
    cv2.ellipse(canvas, (sx + 35, sy - 50), (22, 55), 35, 0, 360, (130, 45, 20), -1)

    # Red Boots
    cv2.ellipse(canvas, (sx - 65, sy - 90), (16, 28), -40, 0, 360, (30, 25, 195), -1)
    cv2.ellipse(canvas, (sx + 50, sy - 95), (15, 25), 45, 0, 360, (30, 25, 195), -1)

    # Torso (Classic 2002 Red Chest & Blue sides)
    cv2.ellipse(canvas, (sx - 25, sy + 10), (15, 45), 10, 0, 360, (130, 45, 20), -1)
    cv2.ellipse(canvas, (sx + 25, sy + 10), (15, 45), -10, 0, 360, (130, 45, 20), -1)
    cv2.ellipse(canvas, (sx, sy + 15), (28, 55), 0, 0, 360, (30, 25, 195), -1)

    # Black Spider Chest Emblem
    cv2.ellipse(canvas, (sx, sy + 15), (7, 14), 0, 0, 360, (10, 10, 10), -1)

    # Arms
    # Right arm extended up holding web line
    cv2.line(canvas, (sx - 20, sy - 10), (sx - 15, sy - 80), (30, 25, 195), 14)
    # Left arm reaching down firing / holding lower web
    cv2.line(canvas, (sx + 20, sy + 5), (sx + 30, sy + 70), (30, 25, 195), 14)
    cv2.line(canvas, (sx + 30, sy + 70), (sx + 22, sy + 110), (30, 25, 195), 10)

    # Spider-Man Head & Mask
    hx, hy = sx - 5, sy + 85
    cv2.circle(canvas, (hx, hy), 32, (30, 25, 195), -1)
    cv2.circle(canvas, (hx, hy), 32, (15, 10, 120), 2)

    # Raised Silver Webbing pattern on mask
    for a in range(0, 360, 40):
        rad = math.radians(a)
        ex = int(hx + 30 * math.cos(rad))
        ey = int(hy + 30 * math.sin(rad))
        cv2.line(canvas, (hx, hy), (ex, ey), (160, 150, 140), 1)

    # 2002 Sharp Triangular White Eye Lenses with Black Borders
    left_eye = np.array([[hx - 8, hy - 4], [hx - 22, hy - 14], [hx - 10, hy - 18]], np.int32)
    right_eye = np.array([[hx + 8, hy - 4], [hx + 22, hy - 14], [hx + 10, hy - 18]], np.int32)
    cv2.fillPoly(canvas, [left_eye], (250, 250, 255))
    cv2.polylines(canvas, [left_eye], True, (15, 10, 10), 2)
    cv2.fillPoly(canvas, [right_eye], (250, 250, 255))
    cv2.polylines(canvas, [right_eye], True, (15, 10, 10), 2)

    # 5. Taut Tensile White Web Line
    wx1, wy1 = sx + 22, sy + 110 # Spider-Man's wrist
    wx2, wy2 = 525, 1340         # Mary Jane's reaching hand

    # Glow layer
    cv2.line(canvas, (wx1, wy1), (wx2, wy2), (240, 200, 160), 6) # Cyan/White glow
    cv2.line(canvas, (wx1, wy1), (wx2, wy2), (255, 255, 255), 3) # Core white silk

    # 6. Mary Jane Watson (Kirsten Dunst) - Suspended over East River (y ≈ 1380)
    mx, my = 520, 1420

    # Auburn-Red Hair blowing dramatically in the river wind
    hair_color = (25, 45, 165) # Auburn / Crimson-Red in BGR
    for offset in range(-35, 40, 6):
        cv2.ellipse(canvas, (mx - 20 + offset, my - 60 - abs(offset)//2), (22, 55), 25, 0, 360, hair_color, -1)

    # Face & Skin Tone
    cv2.ellipse(canvas, (mx - 8, my - 35), (20, 25), 15, 0, 360, (170, 205, 240), -1)

    # Iconic Black Coat / Dress
    coat_pts = np.array([
        [mx - 25, my - 15],
        [mx + 25, my - 20],
        [mx + 60, my + 130],
        [mx - 50, my + 140]
    ], np.int32)
    cv2.fillPoly(canvas, [coat_pts], (22, 18, 15))
    cv2.polylines(canvas, [coat_pts], True, (45, 38, 30), 2)

    # Outstretched Arms reaching toward Spider-Man & Web Line
    # Left Arm
    cv2.line(canvas, (mx - 20, my - 10), (mx - 40, my - 70), (22, 18, 15), 10)
    cv2.circle(canvas, (mx - 42, my - 82), 7, (170, 205, 240), -1) # Hand
    # Right Arm (reaching for the web!)
    cv2.line(canvas, (mx + 15, my - 15), (wx2, wy2), (22, 18, 15), 10)
    cv2.circle(canvas, (wx2, wy2), 7, (170, 205, 240), -1) # Reaching hand touching web

    # Legs & Leather Boots
    cv2.line(canvas, (mx - 15, my + 120), (mx - 28, my + 210), (15, 12, 10), 12)
    cv2.line(canvas, (mx + 15, my + 115), (mx + 25, my + 200), (15, 12, 10), 12)

    # 7. Volumetric Night Lighting & Bridge Glow
    # Warm Amber Bridge Lights
    for bx, by in [(200, 480), (380, 580), (680, 580), (860, 480)]:
        cv2.circle(canvas, (bx, by), 6, (140, 230, 255), -1)
        # Glow halo
        halo = np.zeros((height, width, 3), dtype=np.uint8)
        cv2.circle(halo, (bx, by), 35, (30, 80, 120), -1)
        canvas = cv2.add(canvas, halo)

    # Water highlights
    for _ in range(45):
        rx = np.random.randint(50, width - 50)
        ry = np.random.randint(1450, height - 20)
        cv2.line(canvas, (rx, ry), (rx + np.random.randint(15, 60), ry), (70, 60, 45), 1)

    # Save output as scene_full_color.jpg
    cv2.imwrite('scene_full_color.jpg', canvas, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    print("Successfully rendered Spider-Man & Mary Jane (2002) Queensboro Bridge scene to scene_full_color.jpg!")

if __name__ == '__main__':
    render_scene()
