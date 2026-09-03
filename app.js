/**
 * Spider-Man & Gwen Stacy - Interactive Web Simulator
 * Replicates Python Turtle & OpenCV contour rendering step-by-step.
 */

// Canvas & DOM Elements
const canvas = document.getElementById('turtleCanvas');
const ctx = canvas.getContext('2d');
const turtlePen = document.getElementById('turtlePen');
const penCoords = document.getElementById('penCoords');
const progressBar = document.getElementById('progressBar');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const restartBtn = document.getElementById('restartBtn');
const instantBtn = document.getElementById('instantBtn');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const canvasWrapper = document.querySelector('.canvas-wrapper');

// Telemetry Elements
const phaseBadge = document.getElementById('phaseBadge');
const statusIndicator = document.getElementById('statusIndicator');
const statPercent = document.getElementById('statPercent');
const statPoints = document.getElementById('statPoints');
const statCoords = document.getElementById('statCoords');
const statTime = document.getElementById('statTime');

// State Variables
let contoursData = null;
let points = [];
let totalPoints = 0;
let currentIndex = 0;
let isPlaying = true;
let isFinished = false;
let startTime = Date.now();
let elapsedTime = 0;
let lastFrameTime = performance.now();
let isDarkCanvas = false;

// Speed configuration mapping (points per second)
// Slider values 1 to 10
function getPointsPerSecond(sliderVal) {
  const speeds = [30, 60, 100, 150, 250, 450, 750, 1200, 2500, 6000];
  return speeds[sliderVal - 1] || 150;
}

let accumulator = 0;

// Coordinate transformation: Maps Turtle centered coordinates to Canvas space
const VIRTUAL_WIDTH = 986;
const VIRTUAL_HEIGHT = 700;

function toCanvasCoords(tx, ty) {
  // Canvas pixel coordinates
  const scale = Math.min(canvas.width / VIRTUAL_WIDTH, canvas.height / VIRTUAL_HEIGHT);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  const x = cx + tx * scale;
  const y = cy - ty * scale; // Invert Y for turtle space
  return { x, y, scale };
}

// Update DOM pen overlay position
function updatePenOverlay(tx, ty) {
  const { x, y } = toCanvasCoords(tx, ty);
  const rect = canvas.getBoundingClientRect();
  const screenX = (x / canvas.width) * rect.width;
  const screenY = (y / canvas.height) * rect.height;
  
  turtlePen.style.transform = `translate(${screenX}px, ${screenY}px)`;
  penCoords.textContent = `(${tx}, ${ty})`;
}

// Resize Canvas keeping High-DPI sharpness
function resizeCanvas() {
  const rect = canvasWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  redrawUpTo(currentIndex);
}

// Redraw all lines up to the given index
function redrawUpTo(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!points || points.length === 0) return;

  const drawColor = isDarkCanvas ? '#ffffff' : '#0a0a0a';
  const fillColor = isDarkCanvas ? '#ffffff' : '#0a0a0a';

  ctx.strokeStyle = drawColor;
  ctx.lineWidth = Math.max(1.8, canvas.width / 450);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const first = toCanvasCoords(points[0][0], points[0][1]);
  ctx.moveTo(first.x, first.y);

  const limit = Math.min(index, points.length);
  for (let i = 1; i < limit; i++) {
    const pt = toCanvasCoords(points[i][0], points[i][1]);
    ctx.lineTo(pt.x, pt.y);
  }

  ctx.stroke();

  // If drawing completed, fill the silhouette!
  if (isFinished) {
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
}

// Update Telemetry Displays
function updateTelemetry() {
  if (totalPoints === 0) return;

  const pct = Math.min(100, Math.round((currentIndex / totalPoints) * 100));
  statPercent.textContent = `${pct}%`;
  progressBar.style.width = `${pct}%`;
  statPoints.textContent = `${currentIndex.toLocaleString()} / ${totalPoints.toLocaleString()}`;
  
  if (points[currentIndex]) {
    const [tx, ty] = points[currentIndex];
    statCoords.textContent = `${tx}, ${ty}`;
  }

  statTime.textContent = `${(elapsedTime / 1000).toFixed(1)}s`;

  // Determine narrative phase
  if (isFinished) {
    phaseBadge.textContent = '✨ Complete Silhouette';
    phaseBadge.style.color = '#34d399';
  } else if (currentIndex < 400) {
    phaseBadge.textContent = '🕷️ Phase 1: Spider-Man';
    phaseBadge.style.color = '#e62429';
  } else if (currentIndex < 750) {
    phaseBadge.textContent = '🕸️ Phase 2: Web Line Descent';
    phaseBadge.style.color = '#38bdf8';
  } else if (currentIndex < 1550) {
    phaseBadge.textContent = '👗 Phase 3: Gwen Stacy (Free Fall)';
    phaseBadge.style.color = '#a855f7';
  } else {
    phaseBadge.textContent = '🔄 Phase 4: Closing Loop';
    phaseBadge.style.color = '#f59e0b';
  }
}

// Main Animation Loop
function animate(currentTime) {
  const dt = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  if (isPlaying && !isFinished && points.length > 0) {
    elapsedTime += dt * 1000;
    
    const pps = getPointsPerSecond(parseInt(speedSlider.value, 10));
    accumulator += dt * pps;
    
    const stepsToAdvance = Math.floor(accumulator);
    if (stepsToAdvance > 0) {
      accumulator -= stepsToAdvance;
      const prevIndex = currentIndex;
      currentIndex = Math.min(currentIndex + stepsToAdvance, totalPoints);

      // Draw incremental segments
      ctx.strokeStyle = isDarkCanvas ? '#ffffff' : '#0a0a0a';
      ctx.lineWidth = Math.max(1.8, canvas.width / 450);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const startPt = toCanvasCoords(points[Math.max(0, prevIndex - 1)][0], points[Math.max(0, prevIndex - 1)][1]);
      ctx.moveTo(startPt.x, startPt.y);

      for (let i = prevIndex; i < currentIndex; i++) {
        const pt = toCanvasCoords(points[i][0], points[i][1]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      if (points[currentIndex - 1]) {
        updatePenOverlay(points[currentIndex - 1][0], points[currentIndex - 1][1]);
      }

      if (currentIndex >= totalPoints) {
        finishDrawing();
      }
    }

    updateTelemetry();
  }

  requestAnimationFrame(animate);
}

function finishDrawing() {
  isFinished = true;
  currentIndex = totalPoints;
  turtlePen.style.display = 'none';
  
  // Fill in the silhouette
  redrawUpTo(totalPoints);
  
  statusIndicator.textContent = 'Complete';
  statusIndicator.className = 'badge badge-status finished';
  playIcon.textContent = '🔄';
  playText.textContent = 'Replay';
  updateTelemetry();
}

function restartDrawing() {
  currentIndex = 0;
  isFinished = false;
  isPlaying = true;
  elapsedTime = 0;
  startTime = Date.now();
  accumulator = 0;
  turtlePen.style.display = 'block';
  
  statusIndicator.textContent = 'Drawing';
  statusIndicator.className = 'badge badge-status running';
  playIcon.textContent = '⏸️';
  playText.textContent = 'Pause';
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (points.length > 0) {
    updatePenOverlay(points[0][0], points[0][1]);
  }
  updateTelemetry();
}

function togglePlayPause() {
  if (isFinished) {
    restartDrawing();
    return;
  }
  isPlaying = !isPlaying;
  if (isPlaying) {
    playIcon.textContent = '⏸️';
    playText.textContent = 'Pause';
    statusIndicator.textContent = 'Drawing';
    statusIndicator.className = 'badge badge-status running';
  } else {
    playIcon.textContent = '▶️';
    playText.textContent = 'Resume';
    statusIndicator.textContent = 'Paused';
    statusIndicator.className = 'badge badge-status paused';
  }
}

function instantFinish() {
  currentIndex = totalPoints;
  finishDrawing();
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
restartBtn.addEventListener('click', restartDrawing);
instantBtn.addEventListener('click', instantFinish);

speedSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  const labels = ['Very Slow (0.2x)', 'Slow (0.4x)', 'Relaxed (0.7x)', 'Normal (1.0x)', 'Swift (1.8x)', 'Fast (3.0x)', 'Faster (5.0x)', 'Rapid (8.0x)', 'Turbo (15x)', 'Instant (50x)'];
  speedDisplay.textContent = labels[val - 1] || `${val}x`;
});

themeToggleBtn.addEventListener('click', () => {
  isDarkCanvas = !isDarkCanvas;
  canvasWrapper.classList.toggle('inverted', isDarkCanvas);
  redrawUpTo(currentIndex);
});

window.addEventListener('resize', resizeCanvas);

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlayPause();
  } else if (e.key === 'r' || e.key === 'R') {
    restartDrawing();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    speedSlider.value = Math.min(10, parseInt(speedSlider.value, 10) + 1);
    speedSlider.dispatchEvent(new Event('input'));
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    speedSlider.value = Math.max(1, parseInt(speedSlider.value, 10) - 1);
    speedSlider.dispatchEvent(new Event('input'));
  }
});

// Load Contours Data
fetch('contours.json')
  .then(res => res.json())
  .then(data => {
    contoursData = data;
    points = data.contours[0] || [];
    totalPoints = points.length;
    
    resizeCanvas();
    if (points.length > 0) {
      updatePenOverlay(points[0][0], points[0][1]);
    }
    updateTelemetry();
    requestAnimationFrame(animate);
  })
  .catch(err => {
    console.error('Failed to load contours.json:', err);
    phaseBadge.textContent = 'Error loading data';
  });
