import { startLoop } from "../../shared/game-loop.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");

let t = 0;

function reset() {
  t = 0;
  hud.setScore(0);
  overlay.classList.add("hidden");
}

const hud = createHud("my-game", {
  onPlay: () => {
    reset();
    hud.start();
    game.paused = false;
  },
  onPause: () => {
    game.paused = true;
  },
  onReset: () => {
    reset();
    hud.start();
    game.paused = false;
  },
});

hud.loadBest();

const game = {
  paused: false,
  update(dt) {
    if (!hud.isActive()) return;
    t += dt;
    hud.setScore(Math.floor(t * 10));
  },
  draw(ctx, w, h) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 22px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Edit game.js", w / 2, h / 2);
  },
};

startLoop(game, canvas);
