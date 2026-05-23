import { createHud } from "../../shared/game-hud.js";

const SIZE = 4;
const gridBg = document.getElementById("gridBg");
const tilesEl = document.getElementById("tiles");
const scoreEl = document.getElementById("score");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMsg = document.getElementById("overlayMsg");
const continueBtn = document.getElementById("continue");
const restartBtn = document.getElementById("restart");

let grid, score, won, keepPlaying;

const hud = createHud("game-2048", {
  scoreLabel: "Score",
  onPlay: () => {
    overlay.classList.add("hidden");
    if (!canMove() && !won) init();
  },
  onPause: () => {},
  onReset: () => {
    init();
    hud.start();
  },
});

hud.loadBest();

for (let i = 0; i < SIZE * SIZE; i++) {
  const c = document.createElement("div");
  c.className = "cell-bg";
  gridBg.appendChild(c);
}

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function randomCell() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function init() {
  grid = emptyGrid();
  score = 0;
  won = false;
  keepPlaying = false;
  hud.setScore(0);
  scoreEl.textContent = "0";
  overlay.classList.add("hidden");
  randomCell();
  randomCell();
  render();
}

function slideRow(row) {
  const nums = row.filter((n) => n);
  const out = [];
  let gained = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === nums[i + 1]) {
      const v = nums[i] * 2;
      out.push(v);
      gained += v;
      if (v === 2048 && !won) won = true;
      i++;
    } else out.push(nums[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained, changed: out.some((v, i) => v !== row[i]) };
}

function move(dir) {
  if (!hud.isActive()) return false;
  let moved = false;
  let gained = 0;
  const ng = emptyGrid();

  if (dir === "left" || dir === "right") {
    for (let r = 0; r < SIZE; r++) {
      let row = [...grid[r]];
      if (dir === "right") row.reverse();
      const res = slideRow(row);
      if (res.changed) moved = true;
      gained += res.gained;
      if (dir === "right") res.row.reverse();
      ng[r] = res.row;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = grid.map((row) => row[c]);
      if (dir === "down") col.reverse();
      const res = slideRow(col);
      if (res.changed) moved = true;
      gained += res.gained;
      if (dir === "down") res.row.reverse();
      for (let r = 0; r < SIZE; r++) ng[r][c] = res.row[r];
    }
  }

  if (!moved) return false;
  grid = ng;
  score += gained;
  hud.setScore(score);
  scoreEl.textContent = String(score);
  hud.saveBest();
  randomCell();
  render();
  if (won && !keepPlaying) showOverlay("You win!", "Reached 2048!");
  else if (!canMove()) {
    showOverlay("Game Over", `Score: ${score}`);
    hud.stop();
  }
  return true;
}

function canMove() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if (!v) return true;
      if (c < SIZE - 1 && grid[r][c + 1] === v) return true;
      if (r < SIZE - 1 && grid[r + 1][c] === v) return true;
    }
  return false;
}

function showOverlay(title, msg) {
  overlayTitle.textContent = title;
  overlayMsg.textContent = msg;
  overlay.classList.remove("hidden");
  continueBtn.style.display = won && !keepPlaying ? "" : "none";
}

function render() {
  tilesEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if (!v) continue;
      const t = document.createElement("div");
      const cls = v <= 2048 ? `tile-${v}` : "tile-super";
      t.className = `tile ${cls}`;
      t.textContent = v;
      t.style.gridRow = String(r + 1);
      t.style.gridColumn = String(c + 1);
      tilesEl.appendChild(t);
    }
  }
}

window.addEventListener("keydown", (e) => {
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (map[e.key]) {
    e.preventDefault();
    move(map[e.key]);
  }
});

continueBtn.addEventListener("click", () => {
  keepPlaying = true;
  overlay.classList.add("hidden");
  hud.start();
});
restartBtn.addEventListener("click", () => document.getElementById("hudReset")?.click());

init();
