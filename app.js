/**
 * Spider-Man & Gwen Stacy - Advanced Interactive Web Simulator
 * Features:
 *   - Web Audio API Sound Synthesizer (THWIP web-shooter, Wind, Dramatic Bass)
 *   - 4 Dynamic Art Styles (Classic B&W, Neon Comic, Clocktower Gothic, Blueprint)
 *   - Cinematic Drone-Cam Tracking (Follows pen in dramatic close-up)
 *   - High-DPI Vector Rendering with Spider-Man Mask Eye Highlights
 *   - HD PNG and SVG Export
 */

// DOM Elements
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
const canvasWrapper = document.querySelector('.canvas-wrapper');

// Advanced Control Elements
const realSceneBtn = document.getElementById('realSceneBtn');
const realSceneOverlay = document.getElementById('realSceneOverlay');
let realSceneActive = false;
const sketchSceneBtn = document.getElementById('sketchSceneBtn');
const sketchSceneOverlay = document.getElementById('sketchSceneOverlay');
let sketchSceneActive = false;
const soundToggleBtn = document.getElementById('soundToggleBtn');
const camToggleBtn = document.getElementById('camToggleBtn');
const exportBtn = document.getElementById('exportBtn');
const pillBtns = document.querySelectorAll('.pill-btn');

// Telemetry Elements
const phaseBadge = document.getElementById('phaseBadge');
const statusIndicator = document.getElementById('statusIndicator');
const statPercent = document.getElementById('statPercent');
const statPoints = document.getElementById('statPoints');
const statCoords = document.getElementById('statCoords');
const statTime = document.getElementById('statTime');

// Global State
let points = [];
let totalPoints = 0;
let currentIndex = 0;
let isPlaying = true;
let isFinished = false;
let startTime = Date.now();
let elapsedTime = 0;
let lastFrameTime = performance.now();
let currentStyle = 'classic';
let soundEnabled = true;
let camDroneActive = false;
let audioCtx = null;
let thwipPlayed = false;
let impactPlayed = false;

// -------------------------------------------------------------
// Web Audio API Synthesizer (Zero External Dependencies)
// -------------------------------------------------------------
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesize Spider-Man's iconic "THWIP!" web-shooter sound
function playThwipSound() {
  if (!soundEnabled) return;
  const actx = getAudioContext();
  if (!actx) return;

  const osc = actx.createOscillator();
  const gain = actx.createGain();
  const filter = actx.createBiquadFilter();

  osc.type = 'sawtooth';
  // Rapid pitch envelope: 1200Hz -> 180Hz (whoosh snap)
  osc.frequency.setValueAtTime(1400, actx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(160, actx.currentTime + 0.18);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, actx.currentTime);
  filter.Q.setValueAtTime(4.0, actx.currentTime);

  gain.gain.setValueAtTime(0.35, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(actx.destination);

  osc.start();
  osc.stop(actx.currentTime + 0.22);
}

// Synthesize Dramatic Cinematic Impact / Silhouette Fill chord
function playImpactSound() {
  if (!soundEnabled) return;
  const actx = getAudioContext();
  if (!actx) return;

  const osc1 = actx.createOscillator();
  const osc2 = actx.createOscillator();
  const gain = actx.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';

  osc1.frequency.setValueAtTime(95, actx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(45, actx.currentTime + 1.2);

  osc2.frequency.setValueAtTime(142, actx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(48, actx.currentTime + 1.2);

  gain.gain.setValueAtTime(0.4, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 1.4);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(actx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(actx.currentTime + 1.4);
  osc2.stop(actx.currentTime + 1.4);
}

// -------------------------------------------------------------
// Coordinate Systems & Projection
// -------------------------------------------------------------
const VIRTUAL_WIDTH = 986;
const VIRTUAL_HEIGHT = 700;

function toCanvasCoords(tx, ty) {
  const scale = Math.min(canvas.width / VIRTUAL_WIDTH, canvas.height / VIRTUAL_HEIGHT);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const x = cx + tx * scale;
  const y = cy - ty * scale;
  return { x, y, scale };
}

// Update DOM pen overlay position & drone-cam origin
function updatePenOverlay(tx, ty) {
  const { x, y } = toCanvasCoords(tx, ty);
  const rect = canvas.getBoundingClientRect();
  const screenX = (x / canvas.width) * rect.width;
  const screenY = (y / canvas.height) * rect.height;

  turtlePen.style.transform = `translate(${screenX}px, ${screenY}px)`;
  penCoords.textContent = `(${tx}, ${ty})`;

  // Smooth Drone Cam Tracking
  if (camDroneActive) {
    const originX = (x / canvas.width) * 100;
    const originY = (y / canvas.height) * 100;
    canvas.style.transformOrigin = `${originX}% ${originY}%`;
  } else {
    canvas.style.transformOrigin = 'center center';
  }
}

// High-DPI Sharp Canvas Resize
function resizeCanvas() {
  const rect = canvasWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  redrawUpTo(currentIndex);
}

// -------------------------------------------------------------
// Art Styles & Shaders
// -------------------------------------------------------------
function getStyleConfig() {
  switch (currentStyle) {
    case 'neon':
      return {
        lineColor: '#ff2a4b',
        fillColor: '#0d0d18',
        webColor: '#38bdf8',
        glow: true,
        glowColor: 'rgba(255, 42, 75, 0.7)',
        glowBlur: 14,
        lineWidth: Math.max(2.2, canvas.width / 420),
        eyeColor: '#38bdf8'
      };
    case 'clocktower':
      return {
        lineColor: '#e2e8f0',
        fillColor: '#0a0d14',
        webColor: '#f1f5f9',
        glow: true,
        glowColor: 'rgba(255, 255, 255, 0.4)',
        glowBlur: 8,
        lineWidth: Math.max(2.0, canvas.width / 450),
        eyeColor: '#ffffff'
      };
    case 'blueprint':
      return {
        lineColor: '#38bdf8',
        fillColor: '#0c284d',
        webColor: '#ffffff',
        glow: false,
        glowBlur: 0,
        lineWidth: Math.max(1.8, canvas.width / 480),
        eyeColor: '#ffffff'
      };
    case 'classic':
    default:
      return {
        lineColor: '#0a0a0a',
        fillColor: '#0a0a0a',
        webColor: '#0a0a0a',
        glow: false,
        glowBlur: 0,
        lineWidth: Math.max(1.8, canvas.width / 450),
        eyeColor: '#ffffff'
      };
  }
}

// Draw Spider-Man's iconic glowing mask lenses once silhouette fills
function drawSpiderEyes() {
  // Spider-Man's head location in turtle coordinates: (~ -9, 145)
  const head = toCanvasCoords(-10, 142);
  const scale = head.scale;
  const cfg = getStyleConfig();

  ctx.save();
  ctx.fillStyle = cfg.eyeColor || '#ffffff';
  ctx.strokeStyle = currentStyle === 'classic' ? '#000000' : 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1.5;

  if (cfg.glow) {
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 10;
  }

  // Left Eye Lens (Curved triangle)
  ctx.beginPath();
  ctx.moveTo(head.x - 7 * scale, head.y - 2 * scale);
  ctx.quadraticCurveTo(head.x - 13 * scale, head.y + 4 * scale, head.x - 3 * scale, head.y + 6 * scale);
  ctx.quadraticCurveTo(head.x - 6 * scale, head.y + 1 * scale, head.x - 7 * scale, head.y - 2 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Eye Lens
  ctx.beginPath();
  ctx.moveTo(head.x + 3 * scale, head.y - 2 * scale);
  ctx.quadraticCurveTo(head.x + 9 * scale, head.y + 4 * scale, head.x - 1 * scale, head.y + 6 * scale);
  ctx.quadraticCurveTo(head.x + 2 * scale, head.y + 1 * scale, head.x + 3 * scale, head.y - 2 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Render the drawing up to the specified point index
function redrawUpTo(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!points || points.length === 0) return;

  const cfg = getStyleConfig();

  ctx.save();
  ctx.strokeStyle = cfg.lineColor;
  ctx.lineWidth = cfg.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (cfg.glow) {
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = cfg.glowBlur;
  }

  ctx.beginPath();
  const first = toCanvasCoords(points[0][0], points[0][1]);
  ctx.moveTo(first.x, first.y);

  const limit = Math.min(index, points.length);
  for (let i = 1; i < limit; i++) {
    const pt = toCanvasCoords(points[i][0], points[i][1]);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // If drawing completed, fill silhouette!
  if (isFinished) {
    ctx.closePath();
    ctx.fillStyle = cfg.fillColor;
    ctx.fill();
    ctx.stroke();

    // In modern/clocktower styles, add Spider-Man glowing eye highlights
    if (currentStyle !== 'classic') {
      drawSpiderEyes();
    }
  }

  ctx.restore();
}

// -------------------------------------------------------------
// Live Telemetry & Phase Management
// -------------------------------------------------------------
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

  // Sound triggers & narrative phase milestones
  if (currentIndex >= 380 && currentIndex <= 420 && !thwipPlayed) {
    playThwipSound();
    thwipPlayed = true;
  }

  if (isFinished) {
    phaseBadge.textContent = '✨ Complete Silhouette';
    phaseBadge.style.color = '#34d399';
  } else if (currentIndex < 400) {
    phaseBadge.textContent = '🕷️ Phase 1: Spider-Man (Ceiling)';
    phaseBadge.style.color = '#e62429';
  } else if (currentIndex < 750) {
    phaseBadge.textContent = '🕸️ Phase 2: Web Line Shooting';
    phaseBadge.style.color = '#38bdf8';
  } else if (currentIndex < 1550) {
    phaseBadge.textContent = '👗 Phase 3: Gwen Stacy (Free Fall)';
    phaseBadge.style.color = '#c084fc';
  } else {
    phaseBadge.textContent = '🔄 Phase 4: Closing Silk Path';
    phaseBadge.style.color = '#fbbf24';
  }
}

// -------------------------------------------------------------
// Animation Loop
// -------------------------------------------------------------
let accumulator = 0;

function getPointsPerSecond(sliderVal) {
  const speeds = [30, 60, 100, 150, 250, 450, 800, 1500, 3000, 8000];
  return speeds[sliderVal - 1] || 150;
}

function animate(currentTime) {
  const dt = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  if (isPlaying && !isFinished && points.length > 0) {
    elapsedTime += dt * 1000;

    const pps = getPointsPerSecond(parseInt(speedSlider.value, 10));
    accumulator += dt * pps;

    const steps = Math.floor(accumulator);
    if (steps > 0) {
      accumulator -= steps;
      const prevIndex = currentIndex;
      currentIndex = Math.min(currentIndex + steps, totalPoints);

      const cfg = getStyleConfig();
      ctx.save();
      ctx.strokeStyle = cfg.lineColor;
      ctx.lineWidth = cfg.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (cfg.glow) {
        ctx.shadowColor = cfg.glowColor;
        ctx.shadowBlur = cfg.glowBlur;
      }

      ctx.beginPath();
      const startPt = toCanvasCoords(points[Math.max(0, prevIndex - 1)][0], points[Math.max(0, prevIndex - 1)][1]);
      ctx.moveTo(startPt.x, startPt.y);

      for (let i = prevIndex; i < currentIndex; i++) {
        const pt = toCanvasCoords(points[i][0], points[i][1]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

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

  if (!impactPlayed) {
    playImpactSound();
    impactPlayed = true;
  }

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
  thwipPlayed = false;
  impactPlayed = false;
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

// -------------------------------------------------------------
// Export High-Definition PNG / SVG
// -------------------------------------------------------------
function exportHD() {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 1920;
  exportCanvas.height = 1080;
  const ectx = exportCanvas.getContext('2d');

  // Background
  ectx.fillStyle = currentStyle === 'classic' ? '#ffffff' : '#0a0d14';
  ectx.fillRect(0, 0, 1920, 1080);

  // Draw full silhouette scaled to 1920x1080
  const scale = Math.min(1920 / VIRTUAL_WIDTH, 1080 / VIRTUAL_HEIGHT) * 0.95;
  const cx = 1920 / 2;
  const cy = 1080 / 2;

  ectx.beginPath();
  const firstX = cx + points[0][0] * scale;
  const firstY = cy - points[0][1] * scale;
  ectx.moveTo(firstX, firstY);

  for (let i = 1; i < points.length; i++) {
    const px = cx + points[i][0] * scale;
    const py = cy - points[i][1] * scale;
    ectx.lineTo(px, py);
  }
  ectx.closePath();

  const cfg = getStyleConfig();
  ectx.fillStyle = currentStyle === 'classic' ? '#000000' : cfg.fillColor;
  ectx.fill();
  ectx.strokeStyle = cfg.lineColor;
  ectx.lineWidth = 3;
  ectx.stroke();

  // Watermark
  ectx.fillStyle = currentStyle === 'classic' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
  ectx.font = '24px Outfit, sans-serif';
  ectx.fillText('Spider-Man & Mary Jane (2002) | Queensboro Bridge Rescue', 60, 1020);

  const link = document.createElement('a');
  link.download = `spiderman_mj_2002_${currentStyle}_hd.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

// -------------------------------------------------------------
// Event Listeners & Controls
// -------------------------------------------------------------
playPauseBtn.addEventListener('click', togglePlayPause);
restartBtn.addEventListener('click', restartDrawing);
instantBtn.addEventListener('click', instantFinish);
exportBtn.addEventListener('click', exportHD);

// Real Scene View Toggle
realSceneBtn.addEventListener('click', () => {
  realSceneActive = !realSceneActive;
  if (realSceneActive) {
    sketchSceneActive = false;
    sketchSceneOverlay.classList.add('hidden');
    sketchSceneBtn.classList.remove('active');
  }
  realSceneOverlay.classList.toggle('hidden', !realSceneActive);
  realSceneBtn.classList.toggle('active', realSceneActive);
});

// Comic Sketch View Toggle
sketchSceneBtn.addEventListener('click', () => {
  sketchSceneActive = !sketchSceneActive;
  if (sketchSceneActive) {
    realSceneActive = false;
    realSceneOverlay.classList.add('hidden');
    realSceneBtn.classList.remove('active');
  }
  sketchSceneOverlay.classList.toggle('hidden', !sketchSceneActive);
  sketchSceneBtn.classList.toggle('active', sketchSceneActive);
});

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
  soundToggleBtn.classList.toggle('active', soundEnabled);
});

// Drone Camera Toggle
camToggleBtn.addEventListener('click', () => {
  camDroneActive = !camDroneActive;
  camToggleBtn.classList.toggle('active', camDroneActive);
  canvasWrapper.classList.toggle('cam-drone-active', camDroneActive);
  camToggleBtn.textContent = camDroneActive ? '🎥 Drone: ON' : '🎥 Drone Cam';
});

// Art Style Switcher
pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const style = btn.getAttribute('data-style');
    currentStyle = style;

    // Remove existing theme classes
    canvasWrapper.className = 'canvas-wrapper';
    canvasWrapper.classList.add(`style-${style}`);
    if (camDroneActive) canvasWrapper.classList.add('cam-drone-active');

    redrawUpTo(currentIndex);
  });
});

// Speed Slider
speedSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  const labels = [
    'Very Slow (0.2x)', 'Slow (0.4x)', 'Relaxed (0.7x)', 'Normal (1.0x)',
    'Swift (1.8x)', 'Fast (3.0x)', 'Faster (5.0x)', 'Rapid (8.0x)',
    'Turbo (15x)', 'Instant (50x)'
  ];
  speedDisplay.textContent = labels[val - 1] || `${val}x`;
});

window.addEventListener('resize', resizeCanvas);

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlayPause();
  } else if (e.key === 'r' || e.key === 'R') {
    restartDrawing();
  } else if (e.key === 'c' || e.key === 'C') {
    camToggleBtn.click();
  } else if (e.key === 'm' || e.key === 'M') {
    soundToggleBtn.click();
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

// Load Contours & Start Simulation
fetch('contours.json')
  .then(res => res.json())
  .then(data => {
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
