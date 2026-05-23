/**
 * Shared score, best, play, pause, reset for all Playground games.
 * @param {string} gameId - unique id (matches games.manifest.json id)
 * @param {{ onPlay?: () => void, onPause?: () => void, onReset?: () => void, scoreLabel?: string, bestLabel?: string, mount?: HTMLElement }} opts
 */
export function createHud(gameId, opts = {}) {
  const key = `playground-best-${gameId}`;
  let score = 0;
  let best = Number(localStorage.getItem(key) || 0);
  let playing = false;
  let paused = false;

  const mount = opts.mount || document.querySelector("[data-game-hud]") || injectBar();

  mount.innerHTML = `
    <div class="hud-stats">
      <div class="hud-stat"><span>${opts.scoreLabel || "Score"}</span><strong id="hudScore">0</strong></div>
      <div class="hud-stat"><span>${opts.bestLabel || "Best"}</span><strong id="hudBest">${best}</strong></div>
    </div>
    <div class="hud-btns">
      <button type="button" class="btn hud-btn-play" id="hudPlay">▶ Play</button>
      <button type="button" class="btn hud-btn-pause" id="hudPause">⏸ Pause</button>
      <button type="button" class="btn btn-ghost hud-btn-reset" id="hudReset">↻ Reset</button>
    </div>
  `;

  const scoreEl = mount.querySelector("#hudScore");
  const bestEl = mount.querySelector("#hudBest");
  const btnPlay = mount.querySelector("#hudPlay");
  const btnPause = mount.querySelector("#hudPause");
  const btnReset = mount.querySelector("#hudReset");

  function updateButtons() {
    btnPlay.textContent = playing && !paused ? "▶ Playing" : "▶ Play";
    btnPause.disabled = !playing;
  }

  btnPlay.addEventListener("click", () => {
    playing = true;
    paused = false;
    updateButtons();
    opts.onPlay?.();
  });

  btnPause.addEventListener("click", () => {
    if (!playing) return;
    paused = true;
    updateButtons();
    opts.onPause?.();
  });

  btnReset.addEventListener("click", () => {
    opts.onReset?.();
    updateButtons();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") {
      if (!playing) return;
      paused = !paused;
      updateButtons();
      if (paused) opts.onPause?.();
      else opts.onPlay?.();
    }
  });

  return {
    get score() { return score; },
    get best() { return best; },
    get playing() { return playing; },
    get paused() { return paused; },
    isActive() { return playing && !paused; },

    setScore(n) {
      score = n;
      if (scoreEl) scoreEl.textContent = String(n);
      const bar = document.querySelector(".game-bar .score");
      if (bar) bar.textContent = String(n);
    },

    addScore(n) {
      this.setScore(score + n);
    },

    saveBest() {
      if (score > best) {
        best = score;
        localStorage.setItem(key, String(best));
        if (bestEl) bestEl.textContent = String(best);
      }
    },

    setBest(n) {
      best = n;
      localStorage.setItem(key, String(best));
      if (bestEl) bestEl.textContent = String(best);
    },

    loadBest() {
      best = Number(localStorage.getItem(key) || 0);
      if (bestEl) bestEl.textContent = String(best);
      return best;
    },

    start() {
      playing = true;
      paused = false;
      updateButtons();
    },

    pause() {
      paused = true;
      updateButtons();
    },

    resume() {
      paused = false;
      updateButtons();
    },

    stop() {
      playing = false;
      paused = false;
      updateButtons();
    },

    resetScore() {
      score = 0;
      this.setScore(0);
    },
  };
}

function injectBar() {
  const bar = document.createElement("div");
  bar.className = "controls-bar";
  bar.setAttribute("data-game-hud", "");
  const gameBar = document.querySelector(".game-bar");
  if (gameBar?.nextSibling) {
    gameBar.parentNode.insertBefore(bar, gameBar.nextSibling);
  } else {
    document.body.prepend(bar);
  }
  return bar;
}
