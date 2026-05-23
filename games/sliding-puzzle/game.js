import { createHud } from "../../shared/game-hud.js";

const SIZE = 4;
const boardEl = document.getElementById("board");
const movesEl = document.getElementById("moves");
const overlay = document.getElementById("overlay");
const winMsg = document.getElementById("winMsg");
const againBtn = document.getElementById("again");

let tiles, emptyR, emptyC, moves;

const hud = createHud("sliding-puzzle", {
  scoreLabel: "Moves",
  bestLabel: "Best (fewest)",
  onPlay: () => {
    shuffle();
    hud.start();
  },
  onPause: () => {},
  onReset: () => {
    hud.resetScore();
    shuffle();
    hud.start();
  },
});

hud.loadBest();

function solvedState() {
  const arr = [];
  for (let i = 1; i < SIZE * SIZE; i++) arr.push(i);
  arr.push(0);
  return arr;
}

function init() {
  tiles = solvedState();
  emptyR = SIZE - 1;
  emptyC = SIZE - 1;
  moves = 0;
  overlay.classList.add("hidden");
  shuffle();
}

function idx(r, c) {
  return r * SIZE + c;
}

function render() {
  boardEl.innerHTML = "";
  movesEl.textContent = `${moves} moves`;
  hud.setScore(moves);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = tiles[idx(r, c)];
      const btn = document.createElement("button");
      btn.type = "button";
      if (v === 0) {
        btn.className = "tile empty";
        btn.disabled = true;
      } else {
        btn.className = "tile";
        btn.textContent = String(v);
        const adj =
          (Math.abs(r - emptyR) === 1 && c === emptyC) ||
          (Math.abs(c - emptyC) === 1 && r === emptyR);
        btn.disabled = !adj || !hud.isActive();
        btn.addEventListener("click", () => slide(r, c));
      }
      boardEl.appendChild(btn);
    }
  }
}

function slide(r, c) {
  if (!hud.isActive()) return;
  tiles[idx(emptyR, emptyC)] = tiles[idx(r, c)];
  tiles[idx(r, c)] = 0;
  emptyR = r;
  emptyC = c;
  moves++;
  render();
  if (isSolved()) {
    winMsg.textContent = `Solved in ${moves} moves!`;
    overlay.classList.remove("hidden");
    const best = hud.loadBest();
    if (!best || moves < best) hud.setBest(moves);
    hud.stop();
  }
}

function isSolved() {
  return tiles.every((v, i) => v === (i === SIZE * SIZE - 1 ? 0 : i + 1));
}

function shuffle() {
  tiles = solvedState();
  emptyR = SIZE - 1;
  emptyC = SIZE - 1;
  moves = 0;
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let i = 0; i < 200; i++) {
    const valid = dirs
      .map(([dr, dc]) => [emptyR + dr, emptyC + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE);
    const [nr, nc] = valid[Math.floor(Math.random() * valid.length)];
    tiles[idx(emptyR, emptyC)] = tiles[idx(nr, nc)];
    tiles[idx(nr, nc)] = 0;
    emptyR = nr;
    emptyC = nc;
  }
  if (isSolved()) shuffle();
  render();
}

againBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());

shuffle();
