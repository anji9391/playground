import { startLoop } from "../../shared/game-loop.js";
import { bindTap } from "../../shared/input.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");

const GROUND_RATIO = 0.78;
let player, obstacles, speed, score, spawnTimer;
let unbindTap;

function reset() {
  player = { x: 80, y: 0, vy: 0, r: 22, grounded: true };
  obstacles = [];
  speed = 280;
  score = 0;
  spawnTimer = 0;
  hud.setScore(0);
  overlay.classList.add("hidden");
}

function jump() {
  if (!hud.isActive()) return;
  if (player.grounded) {
    player.vy = -520;
    player.grounded = false;
  }
}

function crash() {
  hud.setScore(Math.floor(score));
  hud.saveBest();
  hud.stop();
  overlay.classList.remove("hidden");
  overlay.querySelector("h2").textContent = "Crashed!";
  startBtn.textContent = "Try again";
  if (unbindTap) {
    unbindTap();
    unbindTap = null;
  }
}

const hud = createHud("tap-dash", {
  onPlay: () => {
    reset();
    game.paused = false;
    unbindTap = bindTap(jump);
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
    if (unbindTap) {
      unbindTap();
      unbindTap = null;
    }
    overlay.querySelector("h2").textContent = "Tap Dash";
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
    const h = canvas.clientHeight;
    const ground = h * GROUND_RATIO;

    player.vy += 1400 * dt;
    player.y += player.vy * dt;
    if (player.y >= ground - player.r) {
      player.y = ground - player.r;
      player.vy = 0;
      player.grounded = true;
    }

    speed += dt * 8;
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle(h);
      spawnTimer = Math.max(0.45, 0.9 + Math.random() * 0.6 - score * 0.01);
    }

    for (const o of obstacles) o.x -= speed * dt;
    obstacles = obstacles.filter((o) => o.x + o.w > -20);

    const px = player.x;
    const py = player.y;
    for (const o of obstacles) {
      if (
        px + player.r > o.x &&
        px - player.r < o.x + o.w &&
        py + player.r > o.y &&
        py - player.r < o.y + o.h
      ) {
        crash();
        return;
      }
    }

    score += dt * 10;
    hud.setScore(Math.floor(score));
  },
  draw(ctx, w, h) {
    const ground = h * GROUND_RATIO;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#7c2d12");
    sky.addColorStop(1, "#431407");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#292524";
    ctx.fillRect(0, ground, w, h - ground);
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, ground);
    ctx.lineTo(w, ground);
    ctx.stroke();
    ctx.fillStyle = "#fb923c";
    for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
  },
};

function spawnObstacle(h) {
  const ground = h * GROUND_RATIO;
  const tall = Math.random() > 0.55;
  const oh = tall ? 70 + Math.random() * 40 : 36;
  obstacles.push({
    x: canvas.clientWidth + 40,
    y: ground - oh,
    w: 28 + Math.random() * 20,
    h: oh,
  });
}

startBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
startLoop(game, canvas);
