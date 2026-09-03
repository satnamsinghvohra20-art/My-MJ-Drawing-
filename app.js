/**
 * Spider-Man & Gwen Stacy - Advanced Interactive Web Simulator
 * 100% Pure Procedural Coding - Zero Image Files
 * 
 * Modes:
 *   1. Vector Silhouette Mode: The iconic black contour step-by-step turtle drawing
 *   2. Procedural Real Scene Painter: Generates and colors the full dramatic clocktower scene
 *      stroke-by-stroke in real-time across 6 distinct artistic stages!
 */

// -------------------------------------------------------------
// DOM Elements
// -------------------------------------------------------------
const canvas = document.getElementById('turtleCanvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.getElementById('canvasWrapper');
const turtlePen = document.getElementById('turtlePen');
const penCoords = document.getElementById('penCoords');
const penTip = document.getElementById('penTip');
const progressBar = document.getElementById('progressBar');

// Controls
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const restartBtn = document.getElementById('restartBtn');
const instantBtn = document.getElementById('instantBtn');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const camToggleBtn = document.getElementById('camToggleBtn');
const exportBtn = document.getElementById('exportBtn');

// Mode Buttons
const modeSilhouetteBtn = document.getElementById('modeSilhouetteBtn');
const modeRealSceneBtn = document.getElementById('modeRealSceneBtn');
const stylePresets = document.getElementById('stylePresets');
const stageStepper = document.getElementById('stageStepper');
const pillBtns = document.querySelectorAll('.pill-btn');
const stagePills = document.querySelectorAll('.stage-pill');

// Telemetry Elements
const phaseBadge = document.getElementById('phaseBadge');
const statusIndicator = document.getElementById('statusIndicator');
const statPercent = document.getElementById('statPercent');
const statPoints = document.getElementById('statPoints');
const statCoords = document.getElementById('statCoords');
const statTime = document.getElementById('statTime');

// -------------------------------------------------------------
// Global Application State
// -------------------------------------------------------------
let currentMode = 'silhouette'; // 'silhouette' | 'real_scene'
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
let accumulator = 0;

// Procedural Real Scene State
let realSceneSteps = [];
let realSceneStepIndex = 0;
let activeStageFilter = 'all';

// Fixed Canvas Virtual Coordinate Space
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 760;

// Set high-DPI canvas buffer
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// -------------------------------------------------------------
// Web Audio API Synthesizer
// -------------------------------------------------------------
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playThwipSound() {
  if (!soundEnabled) return;
  try {
    const actx = getAudioContext();
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();
    const filter = actx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

function playImpactSound() {
  if (!soundEnabled) return;
  try {
    const actx = getAudioContext();
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio impact error:', e);
  }
}

// -------------------------------------------------------------
// Coordinate Transformations
// -------------------------------------------------------------
function toCanvasCoords(turtleX, turtleY) {
  return {
    x: turtleX + (CANVAS_WIDTH / 2),
    y: (CANVAS_HEIGHT / 2) - turtleY
  };
}

function toTurtleCoords(canvasX, canvasY) {
  return {
    x: Math.round(canvasX - (CANVAS_WIDTH / 2)),
    y: Math.round((CANVAS_HEIGHT / 2) - canvasY)
  };
}

function updatePenOverlay(turtleX, turtleY, hexColor = null) {
  const c = toCanvasCoords(turtleX, turtleY);
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / CANVAS_WIDTH;
  const scaleY = rect.height / CANVAS_HEIGHT;

  const screenX = c.x * scaleX;
  const screenY = c.y * scaleY;

  turtlePen.style.transform = `translate(${screenX}px, ${screenY}px)`;
  penCoords.textContent = `(${Math.round(turtleX)}, ${Math.round(turtleY)})`;

  if (hexColor && penTip) {
    penTip.style.backgroundColor = hexColor;
    penTip.style.boxShadow = `0 0 10px ${hexColor}`;
  }

  if (camDroneActive) {
    const normX = (c.x / CANVAS_WIDTH) * 100;
    const normY = (c.y / CANVAS_HEIGHT) * 100;
    canvasWrapper.style.setProperty('--cam-x', `${normX}%`);
    canvasWrapper.style.setProperty('--cam-y', `${normY}%`);
  }
}

// -------------------------------------------------------------
// Pure Procedural Real Scene Generator
// Generates the 6 stages of drawing instructions
// -------------------------------------------------------------
function buildRealSceneSteps() {
  const steps = [];

  // Helper to add drawing commands
  function addStep(stage, phaseName, drawFn, targetCoords, tipColor = '#f43f5e') {
    steps.push({ stage, phaseName, drawFn, targetCoords, tipColor });
  }

  // -----------------------------------------------------------
  // STAGE 1: Architectural Beams & Gothic Night Sky
  // -----------------------------------------------------------
  addStep(1, 'Stage 1: Gothic Night Sky', (c) => {
    const grad = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#060812');
    grad.addColorStop(0.5, '#0b1329');
    grad.addColorStop(1, '#05070d');
    c.fillStyle = grad;
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, { x: 0, y: 0 }, '#38bdf8');

  addStep(1, 'Stage 1: Distant City & Windows', (c) => {
    // City Silhouette
    c.fillStyle = '#0f172a';
    c.fillRect(60, 480, 50, 240);
    c.fillRect(120, 420, 60, 300);
    c.fillRect(190, 500, 45, 220);

    // Illuminated Window Dots
    c.fillStyle = '#fef08a';
    const windows = [[80, 520], [80, 560], [140, 460], [140, 500], [160, 470], [150, 540], [210, 530]];
    windows.forEach(([wx, wy]) => {
      c.fillRect(wx, wy, 4, 6);
    });
  }, { x: -350, y: -150 }, '#fef08a');

  addStep(1, 'Stage 1: Left Gothic Masonry Pillar', (c) => {
    c.fillStyle = '#1e293b';
    c.strokeStyle = '#0f172a';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(260, 0);
    c.lineTo(260, CANVAS_HEIGHT);
    c.lineTo(0, CANVAS_HEIGHT);
    c.closePath();
    c.fill();
    c.stroke();

    // Arch brickwork lines
    c.strokeStyle = '#334155';
    c.lineWidth = 1.5;
    for (let y = 50; y < CANVAS_HEIGHT; y += 45) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(260, y);
      c.stroke();
    }
  }, { x: -370, y: 100 }, '#64748b');

  addStep(1, 'Stage 1: Heavy Timber Roof Rafters', (c) => {
    // Main Diagonal Rafter
    c.fillStyle = '#29180e';
    c.strokeStyle = '#170d07';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(180, 0);
    c.lineTo(CANVAS_WIDTH, 220);
    c.lineTo(CANVAS_WIDTH, 310);
    c.lineTo(180, 110);
    c.closePath();
    c.fill();
    c.stroke();

    // Wood grain lines
    c.strokeStyle = '#3f2616';
    c.lineWidth = 1.5;
    for (let offset = 20; offset <= 90; offset += 20) {
      c.beginPath();
      c.moveTo(180, offset);
      c.lineTo(CANVAS_WIDTH, 220 + offset);
      c.stroke();
    }

    // Secondary Cross Beam
    c.fillStyle = '#1f120a';
    c.beginPath();
    c.moveTo(380, 0);
    c.lineTo(460, 0);
    c.lineTo(250, 360);
    c.lineTo(190, 360);
    c.closePath();
    c.fill();
    c.stroke();
  }, { x: 100, y: 260 }, '#854d0e');

  // -----------------------------------------------------------
  // STAGE 2: Mechanical Gears & Giant Glowing Clock Face
  // -----------------------------------------------------------
  addStep(2, 'Stage 2: Heavy Brass Clock Gears', (c) => {
    const gx = 750, gy = 380, gr = 190;
    
    // Outer Gear Body
    c.fillStyle = '#713f12';
    c.strokeStyle = '#a16207';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(gx, gy, gr, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // 24 Gear Teeth
    c.fillStyle = '#a16207';
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      c.save();
      c.translate(gx, gy);
      c.rotate(angle);
      c.fillRect(gr - 6, -10, 22, 20);
      c.restore();
    }

    // Spokes & Center Hub
    c.fillStyle = '#1c1917';
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 + 0.3;
      const sx = gx + 105 * Math.cos(angle);
      const sy = gy + 105 * Math.sin(angle);
      c.beginPath();
      c.arc(sx, sy, 35, 0, Math.PI * 2);
      c.fill();
    }

    c.fillStyle = '#ca8a04';
    c.beginPath();
    c.arc(gx, gy, 32, 0, Math.PI * 2);
    c.fill();
  }, { x: 250, y: 0 }, '#ca8a04');

  addStep(2, 'Stage 2: Giant Glowing Clock Face', (c) => {
    const cx = 680, cy = 250, cr = 165;

    // Glowing Radial Light on Glass
    const glow = c.createRadialGradient(cx, cy, 10, cx, cy, cr);
    glow.addColorStop(0, '#ffffff');
    glow.addColorStop(0.4, '#fef08a');
    glow.addColorStop(0.85, '#fde047');
    glow.addColorStop(1, '#ca8a04');

    c.fillStyle = glow;
    c.strokeStyle = '#78350f';
    c.lineWidth = 8;
    c.beginPath();
    c.arc(cx, cy, cr, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Inner Concentric Track Rings
    c.strokeStyle = '#451a03';
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(cx, cy, cr - 16, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, cr - 42, 0, Math.PI * 2);
    c.stroke();

    // Roman Numerals
    c.fillStyle = '#451a03';
    c.font = 'bold 16px Georgia, serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    numerals.forEach((num, i) => {
      const a = (i * 30 - 90) * (Math.PI / 180);
      const nx = cx + (cr - 28) * Math.cos(a);
      const ny = cy + (cr - 28) * Math.sin(a);
      c.fillText(num, nx, ny);
    });

    // Clock Hands (VII and II)
    c.strokeStyle = '#1c1917';
    c.lineCap = 'round';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx - 85, cy + 70); // Hour Hand
    c.stroke();

    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx + 110, cy - 60); // Minute Hand
    c.stroke();

    c.fillStyle = '#0f172a';
    c.beginPath();
    c.arc(cx, cy, 9, 0, Math.PI * 2);
    c.fill();
  }, { x: 180, y: 130 }, '#fde047');

  // -----------------------------------------------------------
  // STAGE 3: Spider-Man (The Hanging Hero)
  // -----------------------------------------------------------
  addStep(3, 'Stage 3: Spider-Man Leg Musculature', (c) => {
    const sx = 480, sy = 120; // Anchor position
    
    // Top anchor webbing
    c.strokeStyle = '#ffffff';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(sx, 0);
    c.lineTo(sx, sy);
    c.stroke();

    // Inverted Legs & Boots
    c.fillStyle = '#1d4ed8'; // Blue suit
    c.beginPath();
    c.moveTo(sx - 8, sy);
    c.lineTo(sx - 45, sy + 30);
    c.lineTo(sx - 55, sy + 75);
    c.lineTo(sx - 20, sy + 90);
    c.lineTo(sx - 8, sy + 50);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(sx + 8, sy);
    c.lineTo(sx + 45, sy + 30);
    c.lineTo(sx + 55, sy + 75);
    c.lineTo(sx + 20, sy + 90);
    c.lineTo(sx + 8, sy + 50);
    c.closePath();
    c.fill();

    // Red Boots
    c.fillStyle = '#dc2626';
    c.beginPath();
    c.arc(sx - 12, sy + 15, 16, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(sx + 12, sy + 15, 16, 0, Math.PI * 2);
    c.fill();
  }, { x: -20, y: 260 }, '#1d4ed8');

  addStep(3, 'Stage 3: Spider-Man Torso & Arms', (c) => {
    const tx = 480, ty = 210;

    // Blue Flanks
    c.fillStyle = '#1e40af';
    c.beginPath();
    c.ellipse(tx - 28, ty, 14, 38, 0.2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(tx + 28, ty, 14, 38, -0.2, 0, Math.PI * 2);
    c.fill();

    // Red Center Chest & Abdomen
    c.fillStyle = '#dc2626';
    c.beginPath();
    c.moveTo(tx - 20, ty - 35);
    c.lineTo(tx + 20, ty - 35);
    c.lineTo(tx + 18, ty + 45);
    c.lineTo(tx - 18, ty + 45);
    c.closePath();
    c.fill();

    // Black Chest Spider Emblem
    c.fillStyle = '#0f172a';
    c.beginPath();
    c.ellipse(tx, ty + 5, 5, 8, 0, 0, Math.PI * 2);
    c.fill();

    // Left Arm (holding web)
    c.fillStyle = '#dc2626';
    c.beginPath();
    c.moveTo(tx - 25, ty - 20);
    c.lineTo(tx - 50, ty - 60);
    c.lineTo(tx - 40, ty - 90);
    c.lineTo(tx - 20, ty - 90);
    c.lineTo(tx - 15, ty - 30);
    c.closePath();
    c.fill();

    // Right Arm (Shooting Web Downwards!)
    c.beginPath();
    c.moveTo(tx + 25, ty - 20);
    c.lineTo(tx + 45, ty + 30);
    c.lineTo(tx + 28, ty + 75);
    c.lineTo(tx + 15, ty + 75);
    c.lineTo(tx + 15, ty + 10);
    c.closePath();
    c.fill();
  }, { x: -20, y: 170 }, '#dc2626');

  addStep(3, 'Stage 3: Spider-Man Mask & White Eye Lenses', (c) => {
    const hx = 480, hy = 285;

    // Mask Base
    c.fillStyle = '#dc2626';
    c.strokeStyle = '#991b1b';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(hx, hy, 28, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Black Web Pattern on Mask
    c.strokeStyle = '#450a0a';
    c.lineWidth = 1;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      c.beginPath();
      c.moveTo(hx, hy);
      c.lineTo(hx + 26 * Math.cos(a), hy + 26 * Math.sin(a));
      c.stroke();
    }

    // Iconic Curved White Mask Eyes (Upside down orientation)
    // Left Eye
    c.fillStyle = '#ffffff';
    c.strokeStyle = '#0f172a';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(hx - 6, hy - 4);
    c.lineTo(hx - 20, hy - 14);
    c.lineTo(hx - 8, hy - 18);
    c.closePath();
    c.fill();
    c.stroke();

    // Right Eye
    c.beginPath();
    c.moveTo(hx + 6, hy - 4);
    c.lineTo(hx + 20, hy - 14);
    c.lineTo(hx + 8, hy - 18);
    c.closePath();
    c.fill();
    c.stroke();
  }, { x: -20, y: 95 }, '#ffffff');

  // -----------------------------------------------------------
  // STAGE 4: The Taut Web Line
  // -----------------------------------------------------------
  addStep(4, 'Stage 4: Tensile Silk Web Line', (c) => {
    const wx1 = 496, wy1 = 285; // Spider-Man's wrist
    const wx2 = 508, wy2 = 580; // Gwen's reaching fingers

    // Web-shooter muzzle glow
    c.fillStyle = '#bae6fd';
    c.beginPath();
    c.arc(wx1, wy1, 6, 0, Math.PI * 2);
    c.fill();

    // Glowing Silk Web Line
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(wx1, wy1);
    c.lineTo(wx2, wy2);
    c.stroke();

    c.strokeStyle = '#ffffff';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(wx1, wy1);
    c.lineTo(wx2, wy2);
    c.stroke();

    // Spiral silk micro-threads
    c.fillStyle = '#e0f2fe';
    for (let i = 0; i < 40; i++) {
      const r = i / 40;
      const lx = wx1 + (wx2 - wx1) * r + Math.sin(i * 1.5) * 4;
      const ly = wy1 + (wy2 - wy1) * r;
      c.beginPath();
      c.arc(lx, ly, 1.8, 0, Math.PI * 2);
      c.fill();
    }
  }, { x: 8, y: -100 }, '#38bdf8');

  // -----------------------------------------------------------
  // STAGE 5: Gwen Stacy (The Tragic Free-Fall)
  // -----------------------------------------------------------
  addStep(5, 'Stage 5: Gwen Stacy Golden Blonde Hair', (c) => {
    const gx = 512, gy = 630;

    // Upward flowing hair strands
    c.fillStyle = '#fef08a';
    c.strokeStyle = '#ca8a04';
    c.lineWidth = 2;
    const strands = [
      [[-25, -20], [-45, -70], [-65, -110], [-35, -75]],
      [[-10, -25], [-20, -85], [-35, -125], [-10, -80]],
      [[10, -25], [[5], -80], [0, -125], [15, -75]],
      [[25, -20], [35, -75], [45, -110], [25, -65]]
    ];

    strands.forEach(pts => {
      c.beginPath();
      c.moveTo(gx + pts[0][0], gy + pts[0][1]);
      pts.slice(1).forEach(pt => c.lineTo(gx + pt[0], gy + pt[1]));
      c.closePath();
      c.fill();
      c.stroke();
    });
  }, { x: 12, y: -250 }, '#fef08a');

  addStep(5, 'Stage 5: Gwen Stacy Face & Headband', (c) => {
    const gx = 512, gy = 635;

    // Head
    c.fillStyle = '#fed7aa';
    c.strokeStyle = '#fb923c';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(gx, gy, 20, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Black Headband
    c.strokeStyle = '#0f172a';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(gx - 16, gy - 12);
    c.lineTo(gx + 16, gy - 12);
    c.stroke();
  }, { x: 12, y: -255 }, '#fed7aa');

  addStep(5, 'Stage 5: Mint-Green Trench Coat & Dress', (c) => {
    const gx = 512, gy = 660;

    // Mint Green Coat Wings (blown open by rushing wind)
    c.fillStyle = '#86efac';
    c.strokeStyle = '#15803d';
    c.lineWidth = 2.5;

    // Left Coat Wing
    c.beginPath();
    c.moveTo(gx - 12, gy);
    c.lineTo(gx - 75, gy - 45);
    c.lineTo(gx - 90, gy + 30);
    c.lineTo(gx - 45, gy + 85);
    c.lineTo(gx - 10, gy + 45);
    c.closePath();
    c.fill();
    c.stroke();

    // Right Coat Wing
    c.beginPath();
    c.moveTo(gx + 12, gy);
    c.lineTo(gx + 70, gy - 35);
    c.lineTo(gx + 85, gy + 35);
    c.lineTo(gx + 40, gy + 85);
    c.lineTo(gx + 10, gy + 45);
    c.closePath();
    c.fill();
    c.stroke();

    // Dark Indigo Dress Underneath
    c.fillStyle = '#1e1b4b';
    c.beginPath();
    c.moveTo(gx - 18, gy);
    c.lineTo(gx + 18, gy);
    c.lineTo(gx + 26, gy + 75);
    c.lineTo(gx - 26, gy + 75);
    c.closePath();
    c.fill();
  }, { x: 12, y: -280 }, '#86efac');

  addStep(5, 'Stage 5: Outstretched Reaching Arms', (c) => {
    const gx = 512, gy = 655;

    // Sleeves
    c.strokeStyle = '#86efac';
    c.lineWidth = 6;
    c.lineCap = 'round';

    // Left Arm reaching up
    c.beginPath();
    c.moveTo(gx - 16, gy);
    c.lineTo(gx - 35, gy - 55);
    c.stroke();

    // Right Arm reaching directly towards the web!
    c.beginPath();
    c.moveTo(gx + 16, gy);
    c.lineTo(gx + 10, gy - 75);
    c.stroke();

    // Delicate reaching hands
    c.fillStyle = '#fed7aa';
    c.beginPath();
    c.arc(gx - 38, gy - 62, 5, 0, Math.PI * 2);
    c.fill();

    c.beginPath();
    c.arc(gx + 10, gy - 80, 5, 0, Math.PI * 2);
    c.fill();
  }, { x: 10, y: -230 }, '#86efac');

  addStep(5, 'Stage 5: Black Tights & Leather Boots', (c) => {
    const gx = 512, gy = 735;

    // Legs
    c.strokeStyle = '#0f172a';
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(gx - 12, gy);
    c.lineTo(gx - 32, gy + 55);
    c.stroke();

    c.beginPath();
    c.moveTo(gx + 12, gy);
    c.lineTo(gx + 28, gy + 50);
    c.stroke();

    // Lace-up Leather Boots
    c.strokeStyle = '#271d17';
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(gx - 32, gy + 55);
    c.lineTo(gx - 45, gy + 100);
    c.stroke();

    c.beginPath();
    c.moveTo(gx + 28, gy + 50);
    c.lineTo(gx + 36, gy + 95);
    c.stroke();
  }, { x: 12, y: -340 }, '#271d17');

  // -----------------------------------------------------------
  // STAGE 6: Volumetric Lighting & Final Debris Polish
  // -----------------------------------------------------------
  addStep(6, 'Stage 6: Volumetric Moonlight God-Rays', (c) => {
    const cx = 680, cy = 250;
    c.save();
    c.globalAlpha = 0.18;
    c.fillStyle = '#fef9c3';

    const rayTargets = [[180, CANVAS_HEIGHT], [350, CANVAS_HEIGHT], [550, CANVAS_HEIGHT]];
    rayTargets.forEach(([tx, ty]) => {
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(tx - 60, ty);
      c.lineTo(tx + 60, ty);
      c.closePath();
      c.fill();
    });
    c.restore();
  }, { x: 180, y: 130 }, '#fef9c3');

  addStep(6, 'Stage 6: Falling Clock Debris & Dust Motes', (c) => {
    // Flying wooden and brass fragments
    const debris = [
      [420, 320, 10, '#854d0e'],
      [580, 440, 14, '#ca8a04'],
      [410, 520, 8, '#451a03'],
      [610, 610, 12, '#713f12'],
      [460, 680, 7, '#a16207']
    ];
    debris.forEach(([dx, dy, dsize, dcol]) => {
      c.fillStyle = dcol;
      c.beginPath();
      c.moveTo(dx, dy);
      c.lineTo(dx + dsize, dy - 5);
      c.lineTo(dx + dsize / 2, dy + dsize);
      c.closePath();
      c.fill();
    });

    // Atmospheric Glowing Dust Motes
    c.fillStyle = '#fef08a';
    const motes = [[450, 260], [530, 340], [480, 410], [540, 480], [470, 550], [520, 620]];
    motes.forEach(([mx, my]) => {
      c.beginPath();
      c.arc(mx, my, 2.5, 0, Math.PI * 2);
      c.fill();
    });
  }, { x: 0, y: 0 }, '#fef08a');

  return steps;
}

// Initialize Procedural Steps
realSceneSteps = buildRealSceneSteps();

// -------------------------------------------------------------
// Vector Silhouette Data Loader
// -------------------------------------------------------------
async function loadContourData() {
  try {
    const response = await fetch('contours.json');
    if (!response.ok) throw new Error('Network error');
    points = await response.json();
    totalPoints = points.length;
    statPoints.textContent = totalPoints.toLocaleString();
  } catch (err) {
    console.warn('Could not load contours.json, generating procedural fallback:', err);
    points = generateFallbackPoints();
    totalPoints = points.length;
    statPoints.textContent = totalPoints.toLocaleString();
  }
}

function generateFallbackPoints() {
  const pts = [];
  const total = 1000;
  for (let i = 0; i < total; i++) {
    const t = (i / total) * Math.PI * 4;
    const y = 350 - (i / total) * 700;
    const x = Math.sin(t) * (40 + Math.sin(i * 0.1) * 30);
    pts.push([Math.round(x), Math.round(y)]);
  }
  return pts;
}

// -------------------------------------------------------------
// Animation Engine
// -------------------------------------------------------------
function getSpeedMultiplier() {
  const val = parseInt(speedSlider.value, 10);
  const speeds = [0.2, 0.4, 0.7, 1.0, 1.8, 3.0, 5.0, 8.0, 15.0, 50.0];
  return speeds[val - 1] || 1.0;
}

function animate(timestamp) {
  const dt = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;

  if (isPlaying && !isFinished) {
    elapsedTime = (Date.now() - startTime) / 1000;
    const speed = getSpeedMultiplier();

    if (currentMode === 'silhouette') {
      // Silhouette Mode Animation
      const basePointsPerSec = 75;
      const pointsToAdvance = basePointsPerSec * speed * dt;
      accumulator += pointsToAdvance;

      const wholePoints = Math.floor(accumulator);
      if (wholePoints > 0) {
        accumulator -= wholePoints;
        const prevIndex = currentIndex;
        currentIndex = Math.min(totalPoints, currentIndex + wholePoints);

        if (currentIndex > 450 && !thwipPlayed) {
          playThwipSound();
          thwipPlayed = true;
        }

        ctx.save();
        ctx.strokeStyle = currentStyle === 'neon' ? '#38bdf8' : '#000000';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        const startPt = toCanvasCoords(points[prevIndex][0], points[prevIndex][1]);
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
    } else {
      // Procedural Real Scene Painter Animation
      const stepsPerSec = 0.8 * speed;
      accumulator += stepsPerSec * dt;

      if (accumulator >= 1) {
        accumulator = 0;
        executeNextRealSceneStep();
      }
    }

    updateTelemetry();
  }

  requestAnimationFrame(animate);
}

function executeNextRealSceneStep() {
  // Check if filtering by stage
  let nextStep = null;
  while (realSceneStepIndex < realSceneSteps.length) {
    const step = realSceneSteps[realSceneStepIndex];
    realSceneStepIndex++;
    if (activeStageFilter === 'all' || step.stage === parseInt(activeStageFilter, 10)) {
      nextStep = step;
      break;
    }
  }

  if (nextStep) {
    // Execute drawing step
    nextStep.drawFn(ctx);

    // Animate brush/pen overlay
    updatePenOverlay(nextStep.targetCoords.x, nextStep.targetCoords.y, nextStep.tipColor);
    phaseBadge.textContent = nextStep.phaseName;

    if (nextStep.stage === 4 && !thwipPlayed) {
      playThwipSound();
      thwipPlayed = true;
    }
  }

  if (realSceneStepIndex >= realSceneSteps.length) {
    finishDrawing();
  }
}

function redrawRealSceneUpTo(targetStepIndex) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < targetStepIndex; i++) {
    const step = realSceneSteps[i];
    if (activeStageFilter === 'all' || step.stage === parseInt(activeStageFilter, 10)) {
      step.drawFn(ctx);
    }
  }
}

function finishDrawing() {
  isFinished = true;
  turtlePen.style.display = 'none';

  if (!impactPlayed) {
    playImpactSound();
    impactPlayed = true;
  }

  if (currentMode === 'silhouette') {
    currentIndex = totalPoints;
    redrawSilhouetteUpTo(totalPoints);
  } else {
    realSceneStepIndex = realSceneSteps.length;
    redrawRealSceneUpTo(realSceneSteps.length);
  }

  statusIndicator.textContent = 'Complete';
  statusIndicator.className = 'badge badge-status finished';
  playIcon.textContent = '🔄';
  playText.textContent = 'Replay';
  updateTelemetry();
}

function restartDrawing() {
  currentIndex = 0;
  realSceneStepIndex = 0;
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

  if (currentMode === 'silhouette' && points.length > 0) {
    updatePenOverlay(points[0][0], points[0][1]);
  } else if (realSceneSteps.length > 0) {
    updatePenOverlay(realSceneSteps[0].targetCoords.x, realSceneSteps[0].targetCoords.y);
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
  if (currentMode === 'silhouette') {
    currentIndex = totalPoints;
    redrawSilhouetteUpTo(totalPoints);
  } else {
    realSceneStepIndex = realSceneSteps.length;
    redrawRealSceneUpTo(realSceneSteps.length);
  }
  finishDrawing();
}

function redrawSilhouetteUpTo(limit) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (limit <= 0) return;

  ctx.save();
  ctx.strokeStyle = currentStyle === 'neon' ? '#38bdf8' : '#000000';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();

  const startPt = toCanvasCoords(points[0][0], points[0][1]);
  ctx.moveTo(startPt.x, startPt.y);

  for (let i = 1; i < limit; i++) {
    const pt = toCanvasCoords(points[i][0], points[i][1]);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  if (limit >= totalPoints) {
    ctx.fillStyle = currentStyle === 'neon' ? '#ef4444' : '#000000';
    ctx.fill();

    // White eye lenses
    const head = toCanvasCoords(-10, 142);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(head.x - 5, head.y + 2, 4, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(head.x + 5, head.y + 2, 4, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function updateTelemetry() {
  let pct = 0;
  if (currentMode === 'silhouette') {
    pct = totalPoints > 0 ? ((currentIndex / totalPoints) * 100) : 0;
    statPoints.textContent = `${currentIndex.toLocaleString()} / ${totalPoints.toLocaleString()}`;
    if (points[currentIndex - 1]) {
      statCoords.textContent = `(${points[currentIndex - 1][0]}, ${points[currentIndex - 1][1]})`;
    }
  } else {
    pct = realSceneSteps.length > 0 ? ((realSceneStepIndex / realSceneSteps.length) * 100) : 0;
    statPoints.textContent = `Step ${realSceneStepIndex} / ${realSceneSteps.length}`;
    if (realSceneSteps[realSceneStepIndex - 1]) {
      const tc = realSceneSteps[realSceneStepIndex - 1].targetCoords;
      statCoords.textContent = `(${tc.x}, ${tc.y})`;
    }
  }

  statPercent.textContent = `${Math.min(100, Math.round(pct))}%`;
  progressBar.style.width = `${Math.min(100, pct)}%`;

  const m = Math.floor(elapsedTime / 60);
  const s = Math.floor(elapsedTime % 60);
  const ms = Math.floor((elapsedTime % 1) * 10);
  statTime.textContent = `${m}:${s.toString().padStart(2, '0')}.${ms}s`;
}

// -------------------------------------------------------------
// HD Export
// -------------------------------------------------------------
function exportHD() {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 1920;
  exportCanvas.height = 1080;
  const ectx = exportCanvas.getContext('2d');

  // Background
  ectx.fillStyle = currentMode === 'real_scene' ? '#0a0d16' : (currentStyle === 'classic' ? '#ffffff' : '#0a0d14');
  ectx.fillRect(0, 0, 1920, 1080);

  // Draw scaled artwork centered
  const scale = 1080 / CANVAS_HEIGHT;
  const drawW = CANVAS_WIDTH * scale;
  const offX = (1920 - drawW) / 2;

  ectx.drawImage(canvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, offX, 0, drawW, 1080);

  // Watermark
  ectx.fillStyle = 'rgba(255,255,255,0.4)';
  ectx.font = '24px Outfit, sans-serif';
  ectx.fillText('Spider-Man & Gwen Stacy | Pure Code Procedural Painting', 60, 1020);

  const link = document.createElement('a');
  link.download = `spiderman_procedural_${currentMode}_hd.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

// -------------------------------------------------------------
// Mode Switching & Controls
// -------------------------------------------------------------
modeSilhouetteBtn.addEventListener('click', () => {
  currentMode = 'silhouette';
  modeSilhouetteBtn.classList.add('active');
  modeRealSceneBtn.classList.remove('active');
  stylePresets.classList.remove('hidden');
  stageStepper.classList.add('hidden');
  phaseBadge.textContent = 'Contour Tracing';
  restartDrawing();
});

modeRealSceneBtn.addEventListener('click', () => {
  currentMode = 'real_scene';
  modeRealSceneBtn.classList.add('active');
  modeSilhouetteBtn.classList.remove('active');
  stylePresets.classList.add('hidden');
  stageStepper.classList.remove('hidden');
  phaseBadge.textContent = 'Stage 1: Architecture';
  restartDrawing();
});

// Stage Pills
stagePills.forEach(pill => {
  pill.addEventListener('click', () => {
    stagePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeStageFilter = pill.getAttribute('data-stage');
    restartDrawing();
  });
});

// Art Style Pills (Silhouette Mode)
pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStyle = btn.getAttribute('data-style');

    canvasWrapper.className = 'canvas-wrapper';
    canvasWrapper.classList.add(`style-${currentStyle}`);
    if (camDroneActive) canvasWrapper.classList.add('cam-drone-active');

    if (currentMode === 'silhouette') {
      redrawSilhouetteUpTo(currentIndex);
    }
  });
});

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
  soundToggleBtn.classList.toggle('active', soundEnabled);
});

// Drone Cam Toggle
camToggleBtn.addEventListener('click', () => {
  camDroneActive = !camDroneActive;
  camToggleBtn.classList.toggle('active', camDroneActive);
  canvasWrapper.classList.toggle('cam-drone-active', camDroneActive);
  camToggleBtn.textContent = camDroneActive ? '🎥 Drone: ON' : '🎥 Drone Cam';
});

// Standard Controls
playPauseBtn.addEventListener('click', togglePlayPause);
restartBtn.addEventListener('click', restartDrawing);
instantBtn.addEventListener('click', instantFinish);
exportBtn.addEventListener('click', exportHD);

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

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'KeyR':
      restartDrawing();
      break;
    case 'KeyM':
      soundToggleBtn.click();
      break;
    case 'KeyC':
      camToggleBtn.click();
      break;
    case 'ArrowUp':
      speedSlider.value = Math.min(10, parseInt(speedSlider.value, 10) + 1);
      speedSlider.dispatchEvent(new Event('input'));
      break;
    case 'ArrowDown':
      speedSlider.value = Math.max(1, parseInt(speedSlider.value, 10) - 1);
      speedSlider.dispatchEvent(new Event('input'));
      break;
  }
});

// -------------------------------------------------------------
// Application Initialization
// -------------------------------------------------------------
async function init() {
  await loadContourData();
  lastFrameTime = performance.now();
  requestAnimationFrame(animate);
}

init();
