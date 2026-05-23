import { createHud } from "../../shared/game-hud.js";

const boardEl = document.getElementById("board");
const turnEl = document.getElementById("turn");
const sx = document.getElementById("sx");
const so = document.getElementById("so");
const sd = document.getElementById("sd");
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
const KEY = "xox-scores";

let cells = Array(9).fill("");
let turn = "X";
let over = false;
let scores = { X: 0, O: 0, D: 0 };

const hud = createHud("xox", {
  scoreLabel: "X Wins",
  onPlay: () => newGame(),
  onPause: () => {},
  onReset: () => {
    newGame();
    hud.start();
  },
});

hud.loadBest();

function loadScores() {
  try {
    scores = { ...scores, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch { /* ignore */ }
  renderScores();
  hud.setScore(scores.X);
}

function saveScores() {
  localStorage.setItem(KEY, JSON.stringify(scores));
}

function renderScores() {
  sx.textContent = scores.X;
  so.textContent = scores.O;
  sd.textContent = scores.D;
  hud.setScore(scores.X);
}

function checkWin() {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return { winner: cells[a], line: [a, b, c] };
    }
  }
  if (cells.every((c) => c)) return { winner: null, line: null };
  return null;
}

function renderBoard(highlight = []) {
  boardEl.innerHTML = "";
  cells.forEach((val, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell" + (val ? ` ${val.toLowerCase()}` : "") + (highlight.includes(i) ? " win" : "");
    btn.textContent = val;
    btn.disabled = over || !!val || !hud.isActive();
    btn.addEventListener("click", () => play(i));
    boardEl.append(btn);
  });
}

function play(i) {
  if (!hud.isActive() || over || cells[i]) return;
  cells[i] = turn;
  const result = checkWin();
  if (result?.winner) {
    over = true;
    scores[result.winner]++;
    saveScores();
    renderScores();
    if (result.winner === "X") hud.saveBest();
    turnEl.textContent = `${result.winner} wins!`;
    renderBoard(result.line);
    return;
  }
  if (result && !result.winner) {
    over = true;
    scores.D++;
    saveScores();
    renderScores();
    turnEl.textContent = "Draw!";
    renderBoard();
    return;
  }
  turn = turn === "X" ? "O" : "X";
  turnEl.textContent = `${turn}'s turn`;
  renderBoard();
}

function newGame() {
  cells = Array(9).fill("");
  turn = "X";
  over = false;
  turnEl.textContent = "X's turn";
  renderBoard();
}

loadScores();
newGame();
