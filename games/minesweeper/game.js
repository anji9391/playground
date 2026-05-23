import { createHud } from "../../shared/game-hud.js";

const SIZE = 9;
const MINES = 10;
const gridEl = document.getElementById("grid");
const minesLeftEl = document.getElementById("minesLeft");
const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const againBtn = document.getElementById("again");

let mines, revealed, flagged, firstClick, over;

const hud = createHud("minesweeper", {
  scoreLabel: "Revealed",
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

function revealedCount() {
  return revealed.flat().filter(Boolean).length;
}

function updateScore() {
  hud.setScore(revealedCount());
}

function init() {
  mines = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  revealed = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  flagged = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  firstClick = true;
  over = false;
  overlay.classList.add("hidden");
  hud.setScore(0);
  updateMinesHud();
  render();
}

function placeMines(skipR, skipC) {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (mines[r][c] || (r === skipR && c === skipC)) continue;
    mines[r][c] = true;
    placed++;
  }
}

function countAdjacent(r, c) {
  let n = 0;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && mines[nr][nc]) n++;
    }
  return n;
}

function reveal(r, c) {
  if (!hud.isActive() || over || flagged[r][c] || revealed[r][c]) return;
  if (firstClick) {
    firstClick = false;
    placeMines(r, c);
  }
  revealed[r][c] = true;
  updateScore();
  if (mines[r][c]) {
    endGame(false);
    return;
  }
  if (countAdjacent(r, c) === 0) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) reveal(nr, nc);
      }
  }
  if (checkWin()) endGame(true);
  render();
}

function toggleFlag(r, c) {
  if (!hud.isActive() || over || revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];
  updateMinesHud();
  render();
}

function checkWin() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!mines[r][c] && !revealed[r][c]) return false;
  return true;
}

function endGame(won) {
  over = true;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (mines[r][c]) revealed[r][c] = true;
  resultTitle.textContent = won ? "You win!" : "Boom!";
  overlay.classList.remove("hidden");
  if (won) hud.saveBest();
  hud.stop();
  render();
}

function updateMinesHud() {
  const flags = flagged.flat().filter(Boolean).length;
  minesLeftEl.textContent = `${MINES - flags} mines`;
}

function render() {
  gridEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cell";
      if (flagged[r][c] && !over) {
        btn.classList.add("flagged");
        btn.textContent = "🚩";
      } else if (revealed[r][c]) {
        btn.classList.add("revealed");
        btn.disabled = true;
        if (mines[r][c]) {
          btn.classList.add("mine");
          btn.textContent = "💣";
        } else {
          const n = countAdjacent(r, c);
          if (n) {
            btn.textContent = String(n);
            btn.classList.add(`n${n}`);
          }
        }
      }
      btn.addEventListener("click", () => reveal(r, c));
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });
      gridEl.appendChild(btn);
    }
  }
}

againBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
init();
