import { createHud } from "../../shared/game-hud.js";

const DURATION = 30;
const holesEl = document.getElementById("holes");
const timerEl = document.getElementById("timer");
const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("finalScore");
const againBtn = document.getElementById("again");

let timeLeft, moleIndex, spawnTimer, tickTimer, holeBtns;

const hud = createHud("whack", {
  onPlay: startGame,
  onPause: () => {
    clearInterval(spawnTimer);
    clearInterval(tickTimer);
    hideMole();
  },
  onReset: () => {
    clearInterval(spawnTimer);
    clearInterval(tickTimer);
    hideMole();
    hud.resetScore();
    timeLeft = DURATION;
    timerEl.textContent = `${timeLeft}s`;
    overlay.classList.add("hidden");
    holeBtns.forEach((h) => h.classList.remove("up", "hit"));
    hud.stop();
  },
});

hud.loadBest();

function buildHoles() {
  holesEl.innerHTML = "";
  holeBtns = [];
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement("button");
    hole.type = "button";
    hole.className = "hole";
    hole.innerHTML = '<span class="mole"></span>';
    hole.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      whack(i);
    });
    holesEl.appendChild(hole);
    holeBtns.push(hole);
  }
}

function hideMole() {
  if (moleIndex >= 0) {
    holeBtns[moleIndex].classList.remove("up", "hit");
    moleIndex = -1;
  }
}

function showRandomMole() {
  hideMole();
  const choices = [];
  for (let i = 0; i < 9; i++) if (i !== moleIndex) choices.push(i);
  moleIndex = choices[Math.floor(Math.random() * choices.length)];
  holeBtns[moleIndex].classList.add("up");
}

function whack(i) {
  if (!hud.isActive()) return;
  if (i === moleIndex && holeBtns[i].classList.contains("up")) {
    hud.addScore(1);
    holeBtns[i].classList.add("hit");
    setTimeout(hideMole, 120);
  }
}

function endGame() {
  clearInterval(spawnTimer);
  clearInterval(tickTimer);
  hideMole();
  hud.saveBest();
  hud.stop();
  finalScore.textContent = `Score: ${hud.score}`;
  overlay.classList.remove("hidden");
}

function startGame() {
  hud.resetScore();
  timeLeft = DURATION;
  moleIndex = -1;
  timerEl.textContent = `${timeLeft}s`;
  overlay.classList.add("hidden");
  holeBtns.forEach((h) => h.classList.remove("up", "hit"));

  spawnTimer = setInterval(() => {
    if (hud.isActive()) showRandomMole();
  }, 700);

  tickTimer = setInterval(() => {
    if (!hud.isActive()) return;
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);

  showRandomMole();
}

againBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
buildHoles();
