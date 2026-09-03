# 🕷️ Spider-Man & Mary Jane (2002) Drawing in Python (Turtle Graphics)

A Python project that animates and draws the iconic silhouette of **Spider-Man (Tobey Maguire) holding a web thread to catch Mary Jane Watson (Kirsten Dunst)** from the 2002 Queensboro Bridge climax, rendered **slowly step-by-step** using **Python's Turtle Graphics** and **OpenCV (`cv2.CHAIN_APPROX_NONE`)**.

---

## 🎥 Step-by-Step Drawing Animation

Unlike static image displayers, this script **animates the physical pen cursor moving across the screen coordinate-by-coordinate in real-time**:
1. **Spider-Man** is traced slowly at the top hanging from the bridge web cables.
2. The **web thread** descends smoothly through the middle of the screen.
3. **Mary Jane** is sketched at the bottom suspended in mid-air with outstretched arms and flowing hair.
4. The silhouette is filled, and the pen hides.

---

## 🚀 How to Run

### Option 1: 🌐 Run in Your Browser (Localhost Web App)
To launch the interactive web simulator in your browser:

```powershell
python server.py
```
Then open your browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

Features in the Web App:
- Step-by-step drawing animation with live pen cursor overlay
- Interactive play/pause, restart, and real-time speed slider (0.2x to 50x)
- Live coordinate telemetry $(X, Y)$, progress %, and current drawing phase
- Synchronized Python/OpenCV code execution inspector
- Theme toggle (Classic White Turtle Canvas vs Cinematic Dark Studio)

---

### Option 2: 🐍 Instant Run Desktop (Python Turtle GUI)
Run using standard Python built-in `turtle` module (no installation needed):

```powershell
python main.py
```

### Option 3: 📷 Run with OpenCV (`cv2.CHAIN_APPROX_NONE`)
Run using the pre-configured virtual environment:

```powershell
.venv\Scripts\python.exe main.py
```
Or run the dedicated OpenCV script:
```powershell
.venv\Scripts\python.exe draw_with_opencv.py
```

---

### Option 4: 🎨 Draw the Real Scene in Multi-Color Comic Ink
Draw the full-color comic book sketch of Spider-Man and Gwen falling in the clock tower:

```powershell
.venv\Scripts\python.exe draw_real_scene.py
```

---

## ⌨️ Live Controls While Drawing

While the Turtle Graphics window is drawing:
- **`[Up Arrow]`** : Speed up the drawing
- **`[Down Arrow]`** : Slow down the drawing
- **`[Space]`** : Fast-forward (finish instantly)
- **`[r]`** : Restart the drawing from the beginning
- **`[Esc]`** or **`[q]`** : Close and exit
- **`Click Window`** : Close once finished

---

## ⚙️ Adjusting the Default Speed

In both [`main.py`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/main.py) and [`draw_with_opencv.py`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/draw_with_opencv.py), you can customize the speed near the top of the file:

```python
# Change STEP_DELAY to adjust how slowly it runs:
#   0.015 -> Slow & cinematic (~32 seconds)
#   0.008 -> Smooth step-by-step (~17 seconds) [Default]
#   0.002 -> Fast (~4 seconds)
DEFAULT_STEP_DELAY = 0.008
```

---

## 📁 Files

| File | Description |
| :--- | :--- |
| [`main.py`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/main.py) | Master runner with slow step-by-step drawing & live speed controls |
| [`draw_with_opencv.py`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/draw_with_opencv.py) | The OpenCV script matching the viral video code (`cv2.CHAIN_APPROX_NONE`) |
| [`contours_data.py`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/contours_data.py) | Pre-extracted vector boundary coordinates for zero-dependency execution |
| [`spiderman.png`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/spiderman.png) | High-definition source silhouette |
| [`spiderman.jpg`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/spiderman.jpg) | High-definition JPEG version |
| [`requirements.txt`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/requirements.txt) | Dependencies (`opencv-python`, `numpy`) |
| [`.venv/`](file:///c:/Users/satna/Downloads/spider-man%20using%20python/.venv/) | Ready-to-use virtual environment |
