const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const completeBtn = document.getElementById("completeBtn");

// =====================
// DRAW STATE
// =====================
let drawing = false;
let drawingEnabled = true;
let lines = [];
let currentLine = [];

// =====================
// IMAGE STATE
// =====================
const images = ["4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.jpeg"];
let currentImageIndex = 0;
const bgImage = new Image();
let imageLoaded = false;

// =====================
// TIMER STATE
// =====================
const TOTAL_TIME = 20; // seconds
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let startTime = null;

// =====================
// IMAGE LOADER
// =====================
function loadImage(index) {
  imageLoaded = false;
  bgImage.src = images[index];
  bgImage.onload = () => {
    imageLoaded = true;
    draw();
  };
}

// =====================
// CANVAS SETUP
// =====================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 120;
  draw();
}

window.addEventListener("resize", resizeCanvas);

// =====================
// GAME FLOW
// =====================
function startGame() {
  document.getElementById("startScreen").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("controls").style.display = "flex";
  resizeCanvas();
  resetGame();
  loadImage(currentImageIndex);
  startTimer();
}

function resetGame() {
  lines = [];
  currentLine = [];
  resetTimer();
  draw();
}

// =====================
// IMAGE NAVIGATION
// =====================
function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length;
  resetGame();
  loadImage(currentImageIndex);
}

function prevImage() {
  currentImageIndex =
    (currentImageIndex - 1 + images.length) % images.length;
  resetGame();
  loadImage(currentImageIndex);
}

// =====================
// TIMER FUNCTIONS
// =====================
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TOTAL_TIME;
  startTime = Date.now();
  drawingEnabled = true;
  completeBtn.style.display = "inline-block";
  updateStopwatch();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateStopwatch();

    if (timeLeft <= 0) {
      forceStopDrawing();
      completeBtn.style.display = "none";
      alert("Time Up!");
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  forceStopDrawing();
  startTimer();
}

function updateStopwatch() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("timeDisplay").textContent =
    String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function completeGame() {
  if (!startTime) return;

  forceStopDrawing();

  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  const remaining = timeLeft;

  alert(
    `Completed!\n\nTime Taken: ${timeTaken}s\nRemaining Time: ${remaining}s`
  );
}

// =====================
// FORCE STOP DRAWING (CRITICAL FIX)
// =====================
function forceStopDrawing() {
  drawingEnabled = false;
  drawing = false;
  currentLine = [];

  try {
    canvas.releasePointerCapture(1);
  } catch {}

  clearInterval(timerInterval);
  timerInterval = null;
}

// =====================
// POINTER UTILS
// =====================
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// =====================
// POINTER EVENTS
// =====================
canvas.addEventListener("pointerdown", e => {
  if (!drawingEnabled) return;

  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  drawing = true;
  currentLine = [getPos(e)];
});

canvas.addEventListener("pointermove", e => {
  if (!drawing || !drawingEnabled) return;

  e.preventDefault();
  currentLine.push(getPos(e));
  draw();
});

canvas.addEventListener("pointerup", e => {
  e.preventDefault();
  drawing = false;

  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch {}

  if (currentLine.length > 1) lines.push(currentLine);
  currentLine = [];
});

canvas.addEventListener("pointercancel", () => {
  drawing = false;
  currentLine = [];
});

// =====================
// DRAWING
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (imageLoaded) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  }

  ctx.lineWidth = 12;
  ctx.lineCap = "round";

  ctx.strokeStyle = "#ff0000";
  lines.forEach(drawLine);

  if (currentLine.length > 1) {
    ctx.strokeStyle = "#0059ffff";
    drawLine(currentLine);
  }
}

function drawLine(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}
