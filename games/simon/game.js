import { createHud } from "../../shared/game-hud.js";

const pad = document.getElementById("pad");
const msg = document.getElementById("msg");
const levelEl = document.getElementById("level");
const startBtn = document.getElementById("start");
const overlay = document.getElementById("overlay");
const finalEl = document.getElementById("final");
const retryBtn = document.getElementById("retry");

const btns = [...pad.querySelectorAll(".pad-btn")];
let sequence, playerStep, level, showing;

const hud = createHud("simon", {
  scoreLabel: "Level",
  onPlay: () => startRun(),
  onPause: () => setPadEnabled(false),
  onReset: () => {
    hud.resetScore();
    init();
  },
});

hud.loadBest();

function init() {
  sequence = [];
  playerStep = 0;
  level = 0;
  showing = false;
  overlay.classList.add("hidden");
  levelEl.textContent = "Level 0";
  msg.textContent = "Press Play to start";
  setPadEnabled(false);
}

function setPadEnabled(on) {
  btns.forEach((b) => (b.disabled = !on));
}

function flash(i) {
  const btn = btns[i];
  btn.classList.add("lit");
  return new Promise((res) => {
    setTimeout(() => {
      btn.classList.remove("lit");
      res();
    }, 400);
  });
}

async function playSequence() {
  showing = true;
  setPadEnabled(false);
  msg.textContent = "Watch…";
  await delay(500);
  for (const i of sequence) {
    if (!hud.isActive()) return;
    await flash(i);
    await delay(200);
  }
  showing = false;
  if (!hud.isActive()) return;
  playerStep = 0;
  msg.textContent = "Your turn!";
  setPadEnabled(true);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function nextRound() {
  level++;
  hud.setScore(level);
  levelEl.textContent = `Level ${level}`;
  sequence.push(Math.floor(Math.random() * 4));
  await playSequence();
}

function onPadClick(i) {
  if (!hud.isActive() || showing) return;
  flash(i);
  if (i !== sequence[playerStep]) {
    gameOver();
    return;
  }
  playerStep++;
  if (playerStep >= sequence.length) {
    setPadEnabled(false);
    msg.textContent = "Nice!";
    setTimeout(() => {
      if (hud.isActive()) nextRound();
    }, 600);
  }
}

function gameOver() {
  setPadEnabled(false);
  finalEl.textContent = `You reached level ${level}`;
  overlay.classList.remove("hidden");
  hud.saveBest();
  hud.stop();
}

async function startRun() {
  init();
  overlay.classList.add("hidden");
  startBtn.disabled = true;
  await nextRound();
  startBtn.disabled = false;
}

startBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
retryBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());

btns.forEach((btn) => {
  btn.addEventListener("click", () => onPadClick(Number(btn.dataset.i)));
});

init();
