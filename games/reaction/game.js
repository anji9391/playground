import { createHud } from "../../shared/game-hud.js";

const arena = document.getElementById("arena");
const arenaText = document.getElementById("arenaText");
const resultEl = document.getElementById("result");
const barScore = document.getElementById("barScore");

let state, greenAt, timeoutId;

const hud = createHud("reaction", {
  scoreLabel: "Last (ms)",
  bestLabel: "Best (ms)",
  onPlay: () => {
    startRound();
  },
  onPause: () => {
    clearTimeout(timeoutId);
    setState("idle", "Paused — press Play");
  },
  onReset: () => {
    clearTimeout(timeoutId);
    hud.resetScore();
    setState("idle", "Click Play, then tap here");
    resultEl.textContent = "";
    barScore.textContent = "—";
    hud.stop();
  },
});

hud.loadBest();
if (hud.best) barScore.textContent = `${hud.best} ms`;

function setState(s, text) {
  state = s;
  arena.className = `arena ${s}`;
  arenaText.textContent = text;
}

function startRound() {
  if (!hud.isActive()) return;
  clearTimeout(timeoutId);
  setState("waiting", "Wait for green…");
  resultEl.textContent = "";
  const delay = 1200 + Math.random() * 2800;
  timeoutId = setTimeout(() => {
    if (!hud.isActive()) return;
    greenAt = performance.now();
    setState("ready", "CLICK!");
  }, delay);
}

arena.addEventListener("click", () => {
  if (!hud.isActive()) return;
  if (state === "waiting") {
    clearTimeout(timeoutId);
    setState("too-soon", "Too soon! Press Play to retry");
    resultEl.textContent = "You clicked before green.";
    return;
  }
  if (state === "ready") {
    const ms = Math.round(performance.now() - greenAt);
    setState("idle", "Press Play for another round");
    resultEl.innerHTML = `Reaction: <strong>${ms} ms</strong>`;
    hud.setScore(ms);
    barScore.textContent = `${ms} ms`;
    if (!hud.best || ms < hud.best) {
      hud.setBest(ms);
      hud.saveBest();
    }
  }
});

setState("idle", "Click Play, then tap here");
