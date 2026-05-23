import { createHud } from "../../shared/game-hud.js";

const COLS = 7;
const ROWS = 6;
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const turnHud = document.getElementById("turnHud");
const overlay = document.getElementById("overlay");
const winTitle = document.getElementById("winTitle");
const playAgain = document.getElementById("playAgain");
let grid, current, over, cells;

const hud = createHud("connect-four", {
  scoreLabel: "Wins",
  onPlay: () => {
    if (over) init();
    overlay.classList.add("hidden");
  },
  onPause: () => {},
  onReset: () => {
    init();
    hud.start();
  },
});

hud.loadBest();
hud.setScore(hud.best || 0);

function init() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  current = "red";
  over = false;
  overlay.classList.add("hidden");
  updateHud();
  render();
}

function updateHud() {
  const name = current === "red" ? "Red" : "Yellow";
  statusEl.textContent = over ? "Game over" : `${name}'s turn — tap a column`;
  turnHud.textContent = over ? "—" : `${name}'s turn`;
}

function render() {
  boardEl.innerHTML = "";
  cells = [];
  for (let r = 0; r < ROWS; r++) {
    const rowCells = [];
    for (let c = 0; c < COLS; c++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "col-btn";
      btn.dataset.col = String(c);
      btn.dataset.row = String(r);
      if (grid[r][c]) {
        const disc = document.createElement("span");
        disc.className = `disc ${grid[r][c]}`;
        btn.appendChild(disc);
        btn.disabled = true;
      } else if (r !== dropRow(c) || over || !hud.isActive()) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => drop(c));
      }
      boardEl.appendChild(btn);
      rowCells.push(btn);
    }
    cells.push(rowCells);
  }
}

function dropRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) if (!grid[r][col]) return r;
  return -1;
}

function drop(col) {
  if (!hud.isActive() || over) return;
  const row = dropRow(col);
  if (row < 0) return;
  grid[row][col] = current;
  render();
  const winCells = checkWin(row, col);
  if (winCells) {
    over = true;
    highlightWin(winCells);
    const name = current === "red" ? "Red" : "Yellow";
    winTitle.textContent = `${name} wins!`;
    overlay.classList.remove("hidden");
    hud.addScore(1);
    hud.saveBest();
    hud.stop();
    updateHud();
    return;
  }
  if (grid.every((row) => row.every(Boolean))) {
    over = true;
    winTitle.textContent = "Draw!";
    overlay.classList.remove("hidden");
    hud.stop();
    updateHud();
    return;
  }
  current = current === "red" ? "yellow" : "red";
  updateHud();
  render();
}

function checkWin(r, c) {
  const p = grid[r][c];
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of dirs) {
    const line = [[r, c]];
    for (const sign of [-1, 1]) {
      let nr = r + dr * sign;
      let nc = c + dc * sign;
      while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === p) {
        line.push([nr, nc]);
        nr += dr * sign;
        nc += dc * sign;
      }
    }
    if (line.length >= 4) return line;
  }
  return null;
}

function highlightWin(coords) {
  for (const [r, c] of coords) {
    const btn = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    const disc = btn?.querySelector(".disc");
    if (disc) disc.classList.add("win");
  }
}

playAgain.addEventListener("click", () => document.getElementById("hudPlay")?.click());
init();
