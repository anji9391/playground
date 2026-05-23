import { startLoop } from "../../shared/game-loop.js";
import { isDown } from "../../shared/input.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");

let w, h, player, meteors, time, spawnAcc;

function reset() {
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  player = { x: w / 2, y: h - 50, w: 32, h: 24, speed: 340 };
  meteors = [];
  time = 0;
  spawnAcc = 0;
  hud.setScore(0);
  overlay.classList.add("hidden");
}

function spawnMeteor() {
  const size = 18 + Math.random() * 28;
  meteors.push({
    x: size + Math.random() * (w - size * 2),
    y: -size,
    r: size,
    vy: 120 + Math.random() * 180 + time * 8,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 3,
  });
}

function hit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.hypot(dx, dy);
  return dist < a.r + Math.max(b.w, b.h) * 0.4;
}

function gameOver() {
  const survived = Math.floor(time * 10);
  hud.setScore(survived);
  hud.saveBest();
  hud.stop();
  overlay.querySelector("h2").textContent = "Crashed!";
  overlay.querySelector("p").textContent = `Survived ${time.toFixed(1)}s · Best ${(hud.best / 10).toFixed(1)}s`;
  startBtn.textContent = "Try again";
  overlay.classList.remove("hidden");
}

const hud = createHud("meteor-dodge", {
  scoreLabel: "Time (×10)",
  onPlay: () => {
    reset();
    game.paused = false;
  },
  onPause: () => {
    game.paused = true;
  },
  onReset: () => {
    hud.resetScore();
    overlay.querySelector("h2").textContent = "Meteor Dodge";
    overlay.querySelector("p").textContent = "Survive the meteor shower!";
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
    time += dt;
    const survived = Math.floor(time * 10);
    hud.setScore(survived);
    document.getElementById("score").textContent = `${time.toFixed(1)}s`;

    if (isDown("arrowleft") || isDown("a")) player.x -= player.speed * dt;
    if (isDown("arrowright") || isDown("d")) player.x += player.speed * dt;
    player.x = Math.max(player.w / 2, Math.min(w - player.w / 2, player.x));

    spawnAcc += dt;
    const rate = Math.max(0.35, 0.9 - time * 0.02);
    while (spawnAcc >= rate) {
      spawnAcc -= rate;
      spawnMeteor();
    }

    for (const m of meteors) {
      m.y += m.vy * dt;
      m.rot += m.vr * dt;
    }
    meteors = meteors.filter((m) => m.y < h + 80);

    for (const m of meteors) {
      if (hit(m, player)) {
        gameOver();
        return;
      }
    }
  },

  draw(ctx, cw, ch) {
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, "#1e1b4b");
    g.addColorStop(1, "#0f172a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect((i * 73) % cw, (i * 41) % ch, 2, 2);
    }

    for (const m of meteors) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);
      ctx.fillStyle = "#78716c";
      ctx.beginPath();
      ctx.moveTo(0, -m.r);
      ctx.lineTo(m.r * 0.8, m.r * 0.3);
      ctx.lineTo(-m.r * 0.6, m.r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(-m.r * 0.2, -m.r * 0.1, m.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.h / 2);
    ctx.lineTo(player.x - player.w / 2, player.y + player.h / 2);
    ctx.lineTo(player.x + player.w / 2, player.y + player.h / 2);
    ctx.closePath();
    ctx.fill();
  },
};

startBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
startLoop(game, canvas);
