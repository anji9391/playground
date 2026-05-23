import { createHud } from "../../shared/game-hud.js";

const EMOJI = ["🎮", "🚀", "🎯", "⭐", "🎨", "🎵", "🍕", "🌈"];
const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const overlay = document.getElementById("overlay");
const winMsg = document.getElementById("win-msg");
const restartBtn = document.getElementById("restart");

let cards = [];
let open = [];
let moves = 0;
let lock = false;

const hud = createHud("memory-match", {
  scoreLabel: "Moves",
  bestLabel: "Best (fewest)",
  onPlay: () => {
    overlay.classList.add("hidden");
    if (cards.length === 0 || cards.every((c) => c.classList.contains("matched"))) reset();
  },
  onPause: () => {},
  onReset: () => {
    hud.resetScore();
    reset();
    hud.start();
  },
});

hud.loadBest();

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reset() {
  moves = 0;
  open = [];
  lock = false;
  movesEl.textContent = "0 moves";
  hud.setScore(0);
  overlay.classList.add("hidden");

  const deck = shuffle([...EMOJI, ...EMOJI]);
  board.innerHTML = "";
  cards = deck.map((emoji, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-btn";
    btn.dataset.emoji = emoji;
    btn.dataset.index = String(i);
    btn.setAttribute("aria-label", "Card");
    btn.addEventListener("click", () => flip(btn));
    board.append(btn);
    return btn;
  });
}

function flip(btn) {
  if (!hud.isActive() || lock || btn.classList.contains("flipped") || btn.classList.contains("matched")) return;

  btn.classList.add("flipped");
  btn.textContent = btn.dataset.emoji;
  open.push(btn);

  if (open.length < 2) return;

  moves++;
  movesEl.textContent = `${moves} move${moves === 1 ? "" : "s"}`;
  hud.setScore(moves);
  lock = true;

  const [a, b] = open;
  if (a.dataset.emoji === b.dataset.emoji) {
    a.classList.add("matched");
    b.classList.add("matched");
    open = [];
    lock = false;
    if (cards.every((c) => c.classList.contains("matched"))) {
      winMsg.textContent = `All pairs found in ${moves} moves!`;
      overlay.classList.remove("hidden");
      const best = hud.loadBest();
      if (!best || moves < best) hud.setBest(moves);
      hud.stop();
    }
  } else {
    setTimeout(() => {
      if (!hud.isActive()) {
        lock = false;
        return;
      }
      a.classList.remove("flipped");
      b.classList.remove("flipped");
      a.textContent = "";
      b.textContent = "";
      open = [];
      lock = false;
    }, 700);
  }
}

restartBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
reset();
