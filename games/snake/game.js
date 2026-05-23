import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart");

const CELL = 20;
const COLS = 20;
const ROWS = 20;

let snake, dir, nextDir, food, level, alive, tick, last;

const hud = createHud("snake", {
  scoreLabel: "Score",
  onPlay: () => {
    if (!alive) reset();
    overlay.classList.add("hidden");
  },
  onPause: () => {},
  onReset: () => {
    hud.resetScore();
    reset();
    hud.start();
  },
});

hud.loadBest();

function reset() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  level = 1;
  alive = true;
  tick = 0;
  spawnFood();
  overlay.classList.add("hidden");
  hud.setScore(0);
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
}

function setDir(nx, ny) {
  if (nx === -dir.x && ny === -dir.y) return;
  nextDir = { x: nx, y: ny };
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
    gameOver();
    return;
  }
  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    const score = hud.score + 1;
    level = 1 + Math.floor(score / 5);
    hud.setScore(score);
    spawnFood();
  } else {
    snake.pop();
  }
}

function gameOver() {
  alive = false;
  hud.saveBest();
  hud.stop();
  overlay.classList.remove("hidden");
}

function drawChecker() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#86efac" : "#bbf7d0";
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }
}

function drawCherry(x, y) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(cx - 4, cy + 2, 5, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy + 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#166534";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 2);
  ctx.quadraticCurveTo(cx + 6, cy - 10, cx + 8, cy - 14);
  ctx.stroke();
}

function drawSnake() {
  snake.forEach((seg, i) => {
    const x = seg.x * CELL;
    const y = seg.y * CELL;
    const r = 6;
    ctx.fillStyle = i === 0 ? "#2563eb" : "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, CELL - 4, CELL - 4, r);
    ctx.fill();
    if (i === 0) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x + CELL * 0.65, y + CELL * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e3a8a";
      ctx.beginPath();
      ctx.arc(x + CELL * 0.67, y + CELL * 0.33, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function draw() {
  drawChecker();
  drawCherry(food.x, food.y);
  drawSnake();
}

function loop(now) {
  requestAnimationFrame(loop);
  if (!hud.isActive() || !alive) {
    draw();
    return;
  }
  const interval = Math.max(0.06, 0.14 - level * 0.008);
  if (now - last >= interval * 1000) {
    last = now;
    step();
  }
  draw();
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "arrowup" || k === "w") setDir(0, -1);
  if (k === "arrowdown" || k === "s") setDir(0, 1);
  if (k === "arrowleft" || k === "a") setDir(-1, 0);
  if (k === "arrowright" || k === "d") setDir(1, 0);
});

restartBtn.addEventListener("click", () => {
  reset();
  hud.start();
});

reset();
last = performance.now();
requestAnimationFrame(loop);
