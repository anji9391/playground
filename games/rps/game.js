import { createHud } from "../../shared/game-hud.js";

const picks = ["rock", "paper", "scissors"];
const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
const labels = { rock: "🪨 Rock", paper: "📄 Paper", scissors: "✂️ Scissors" };

const youEl = document.getElementById("you");
const cpuEl = document.getElementById("cpu");
const hudBar = document.getElementById("hudBar");
const battleEl = document.getElementById("battle");
const pickBtns = document.querySelectorAll(".pick");

let youScore, cpuScore;

const hud = createHud("rps", {
  scoreLabel: "You",
  bestLabel: "Best You",
  onPlay: () => {
    pickBtns.forEach((b) => (b.disabled = false));
    battleEl.textContent = "Choose your move";
  },
  onPause: () => {
    pickBtns.forEach((b) => (b.disabled = true));
  },
  onReset: () => {
    youScore = 0;
    cpuScore = 0;
    hud.resetScore();
    hud.setBest(0);
    updateHud();
    battleEl.textContent = "Choose your move";
    pickBtns.forEach((b) => (b.disabled = false));
    hud.start();
  },
});

hud.loadBest();
youScore = 0;
cpuScore = 0;
updateHud();

function updateHud() {
  youEl.textContent = String(youScore);
  cpuEl.textContent = String(cpuScore);
  hudBar.textContent = `${youScore} – ${cpuScore}`;
  hud.setScore(youScore);
}

function play(yours) {
  if (!hud.isActive()) return;
  pickBtns.forEach((b) => (b.disabled = true));
  const cpu = picks[Math.floor(Math.random() * 3)];
  let msg;
  if (yours === cpu) {
    msg = `Draw! Both picked ${labels[yours]}.`;
  } else if (beats[yours] === cpu) {
    youScore++;
    msg = `You win! ${labels[yours]} beats ${labels[cpu]}.`;
    hud.setScore(youScore);
    hud.saveBest();
  } else {
    cpuScore++;
    msg = `CPU wins! ${labels[cpu]} beats ${labels[yours]}.`;
  }
  battleEl.textContent = msg;
  updateHud();
  setTimeout(() => {
    if (hud.isActive()) pickBtns.forEach((b) => (b.disabled = false));
  }, 400);
}

pickBtns.forEach((btn) => {
  btn.addEventListener("click", () => play(btn.dataset.pick));
});
