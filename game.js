const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const completeBtn = document.getElementById("completeBtn");

let drawing = false;
let drawingEnabled = true;
let lines = []; // { points: [], invalid: false }
let currentLine = [];
let currentInvalid = false;

// =====================
// IMAGE STATE
// =====================
const images = ["4.png","5.png","6.png","7.png","8.png","9.png","10.jpeg"];
let currentImageIndex = 0;
const bgImage = new Image();
let imageLoaded = false;

// =====================
// TIMER
// =====================
const TOTAL_TIME = 2 * 60;
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let startTime = null;

// =====================
// IMAGE LOADER
// =====================
function loadImage(i) {
  bgImage.src = images[i];
  bgImage.onload = () => {
    imageLoaded = true;
    draw();
  };
}

// =====================
// CANVAS
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
  currentInvalid = false;
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
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  resetGame();
  loadImage(currentImageIndex);
}

// =====================
// TIMER
// =====================
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TOTAL_TIME;
  drawingEnabled = true;
  completeBtn.style.display = "inline-block";
  updateTime();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) {
      forceStop();
      completeBtn.style.display = "none";
      alert("Time Up!");
    }
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInterval);
  startTimer();
}
function updateTime() {
  document.getElementById("timeDisplay").textContent =
    "00:" + String(timeLeft).padStart(2, "0");
}
function completeGame() {
  forceStop();
  alert("Completed!");
}
function forceStop() {
  drawingEnabled = false;
  drawing = false;
  currentLine = [];
  clearInterval(timerInterval);
}

// =====================
// GEOMETRY (INTERSECTION)
// =====================
function segmentsIntersect(a,b,c,d) {
  const ccw = (p1,p2,p3) =>
    (p3.y-p1.y)*(p2.x-p1.x) > (p2.y-p1.y)*(p3.x-p1.x);
  return (
    ccw(a,c,d) !== ccw(b,c,d) &&
    ccw(a,b,c) !== ccw(a,b,d)
  );
}

function checkIntersection(p1,p2) {
  // Check with previous lines
  for (const line of lines) {
    const pts = line.points;
    for (let i=1;i<pts.length;i++) {
      if (segmentsIntersect(p1,p2,pts[i-1],pts[i])) return true;
    }
  }
  // Self intersection
  for (let i=2;i<currentLine.length;i++) {
    if (segmentsIntersect(
      p1,p2,
      currentLine[i-2],currentLine[i-1]
    )) return true;
  }
  return false;
}

// =====================
// POINTER
// =====================
function getPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x:e.clientX-r.left, y:e.clientY-r.top };
}

canvas.addEventListener("pointerdown", e=>{
  if(!drawingEnabled) return;
  drawing=true;
  currentLine=[getPos(e)];
  currentInvalid=false;
});

canvas.addEventListener("pointermove", e=>{
  if(!drawing || !drawingEnabled) return;
  const p = getPos(e);
  const prev = currentLine[currentLine.length-1];
  if(checkIntersection(prev,p)) currentInvalid=true;
  currentLine.push(p);
  draw();
});

canvas.addEventListener("pointerup", ()=>{
  if(currentLine.length>1){
    lines.push({ points:[...currentLine], invalid:currentInvalid });
  }
  drawing=false;
  currentLine=[];
});

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(imageLoaded) ctx.drawImage(bgImage,0,0,canvas.width,canvas.height);

  ctx.lineWidth=12;
  ctx.lineCap="round";

  for(const l of lines){
    ctx.strokeStyle = l.invalid ? "#ff0000" : "#0059ff";
    drawLine(l.points);
  }

  if(currentLine.length>1){
    ctx.strokeStyle = currentInvalid ? "#ff0000" : "#0059ff";
    drawLine(currentLine);
  }
}

function drawLine(pts){
  ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
  ctx.stroke();
}
