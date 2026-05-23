import { startLoop } from "../../shared/game-loop.js";
import { bindTap } from "../../shared/input.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");

const GRAVITY = 920;
const FLAP = -320;
const PIPE_W = 56;
const GAP = 150;
const PIPE_SPEED = 180;

let w, h, bird, pipes, score, unbindTap;

function reset() {
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  bird = { x: w * 0.28, y: h * 0.45, vy: 0, r: 16, rot: 0 };
  pipes = [];
  score = 0;
  hud.setScore(0);
  overlay.classList.add("hidden");
  spawnPipe(w + 80);
}

function spawnPipe(x) {
  const gapY = 120 + Math.random() * (h - 240 - GAP);
  pipes.push({ x, gapY, scored: false });
}

function flap() {
  if (!hud.isActive()) return;
  bird.vy = FLAP;
}

function gameOver() {
  hud.setScore(score);
  hud.saveBest();
  hud.stop();
  overlay.querySelector("h2").textContent = "Game Over";
  overlay.querySelector("p").textContent = `Score: ${score}`;
  startBtn.textContent = "Play again";
  overlay.classList.remove("hidden");
  if (unbindTap) unbindTap();
  unbindTap = null;
}

const hud = createHud("flappy", {
  onPlay: () => {
    reset();
    unbindTap = bindTap(flap);
    game.paused = false;
  },
  onPause: () => {
    game.paused = true;
    if (unbindTap) {
      unbindTap();
      unbindTap = null;
    }
  },
  onReset: () => {
    hud.resetScore();
    game.paused = false;
    if (unbindTap) {
      unbindTap();
      unbindTap = null;
    }
    overlay.querySelector("h2").textContent = "Sky Flap";
    overlay.querySelector("p").textContent = "Fly through the gaps. Don’t hit the pipes!";
    startBtn.textContent = "Start";
    overlay.classList.remove("hidden");
    hud.stop();
  },
});

hud.loadBest();

const game = {
  paused: false,
  update(dt) {
    if (!hud.isActive()) return;
    bird.vy += GRAVITY * dt;
    bird.y += bird.vy * dt;
    bird.rot = Math.max(-0.5, Math.min(1.2, bird.vy / 400));

    if (bird.y - bird.r < 0 || bird.y + bird.r > h) {
      gameOver();
      return;
    }

    for (const p of pipes) p.x -= PIPE_SPEED * dt;

    while (pipes.length && pipes[0].x + PIPE_W < 0) pipes.shift();
    if (!pipes.length || pipes[pipes.length - 1].x < w - 220) {
      const lastX = pipes.length ? pipes[pipes.length - 1].x : w;
      spawnPipe(lastX + 220);
    }

    for (const p of pipes) {
      const topH = p.gapY;
      const botY = p.gapY + GAP;
      const bx = bird.x;
      const by = bird.y;
      const br = bird.r - 2;
      const inX = bx + br > p.x && bx - br < p.x + PIPE_W;
      if (inX && (by - br < topH || by + br > botY)) {
        gameOver();
        return;
      }
      if (!p.scored && p.x + PIPE_W < bx) {
        p.scored = true;
        score++;
        hud.setScore(score);
      }
    }
  },

  draw(ctx, cw, ch) {
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, "#0c4a6e");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 137 + performance.now() * 0.02) % (cw + 120)) - 60;
      ctx.beginPath();
      ctx.ellipse(cx, 60 + i * 18, 50 + i * 8, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#22c55e";
    for (const p of pipes) {
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
      ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, ch - p.gapY - GAP);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(p.x - 4, p.gapY - 24, PIPE_W + 8, 24);
      ctx.fillRect(p.x - 4, p.gapY + GAP, PIPE_W + 8, 24);
      ctx.fillStyle = "#22c55e";
    }

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rot);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.r, bird.r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(6, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(bird.r - 2, 2);
    ctx.lineTo(bird.r + 10, 6);
    ctx.lineTo(bird.r - 2, 8);
    ctx.fill();
    ctx.restore();
  },
};

startBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
startLoop(game, canvas);
