import { startLoop } from "../../shared/game-loop.js";
import { isDown } from "../../shared/input.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");

let w, h, ship, bullets, aliens, score, shootCd, alienDir, alienStep;

function reset() {
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  ship = { x: w / 2, y: h - 60, w: 36, h: 28, speed: 320 };
  bullets = [];
  aliens = [];
  score = 0;
  shootCd = 0;
  alienDir = 1;
  alienStep = 0;
  hud.setScore(0);
  overlay.classList.add("hidden");
  spawnWave();
}

function spawnWave() {
  aliens = [];
  const cols = 8;
  const rows = 4;
  const gapX = (w - 80) / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      aliens.push({
        x: 40 + c * gapX,
        y: 70 + r * 42,
        w: 28,
        h: 22,
        alive: true,
      });
    }
  }
}

function shoot() {
  bullets.push({ x: ship.x, y: ship.y - ship.h / 2, vy: -520 });
}

function gameOver() {
  hud.setScore(score);
  hud.saveBest();
  hud.stop();
  overlay.querySelector("h2").textContent = "Game Over";
  overlay.querySelector("p").textContent = `Score: ${score}`;
  startBtn.textContent = "Play again";
  overlay.classList.remove("hidden");
}

const hud = createHud("space-shooter", {
  onPlay: () => {
    reset();
    game.paused = false;
  },
  onPause: () => {
    game.paused = true;
  },
  onReset: () => {
    hud.resetScore();
    overlay.querySelector("h2").textContent = "Space Shooter";
    overlay.querySelector("p").textContent = "Destroy the invaders before they land!";
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
    shootCd -= dt;
    if (isDown(" ") || isDown("arrowup")) {
      if (shootCd <= 0) {
        shoot();
        shootCd = 0.22;
      }
    }
    if (isDown("arrowleft") || isDown("a")) ship.x -= ship.speed * dt;
    if (isDown("arrowright") || isDown("d")) ship.x += ship.speed * dt;
    ship.x = Math.max(ship.w / 2 + 8, Math.min(w - ship.w / 2 - 8, ship.x));

    for (const b of bullets) b.y += b.vy * dt;
    bullets = bullets.filter((b) => b.y > -20);

    alienStep += dt;
    if (alienStep > 0.8) {
      alienStep = 0;
      let edge = false;
      for (const a of aliens) {
        if (!a.alive) continue;
        a.x += 18 * alienDir;
        if (a.x < 20 || a.x > w - 20) edge = true;
      }
      if (edge) {
        alienDir *= -1;
        for (const a of aliens) {
          if (a.alive) a.y += 16;
        }
      }
    }

    for (const b of bullets) {
      for (const a of aliens) {
        if (!a.alive) continue;
        if (
          b.x > a.x - a.w / 2 &&
          b.x < a.x + a.w / 2 &&
          b.y > a.y - a.h / 2 &&
          b.y < a.y + a.h / 2
        ) {
          a.alive = false;
          b.y = -999;
          score += 10;
          hud.setScore(score);
        }
      }
    }

    for (const a of aliens) {
      if (a.alive && a.y + a.h / 2 >= ship.y - ship.h / 2) {
        gameOver();
        return;
      }
    }

    if (aliens.every((a) => !a.alive)) spawnWave();
  },

  draw(ctx, cw, ch) {
    ctx.fillStyle = "#070b12";
    ctx.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.1})`;
      const sx = (i * 97) % cw;
      const sy = (i * 53 + performance.now() * 0.03) % ch;
      ctx.fillRect(sx, sy, 2, 2);
    }

    for (const a of aliens) {
      if (!a.alive) continue;
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, a.w / 2, a.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(a.x - 6, a.y - 4, 12, 6);
    }

    for (const b of bullets) {
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(b.x - 2, b.y - 8, 4, 12);
    }

    ctx.fillStyle = "#2dd4bf";
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y - ship.h / 2);
    ctx.lineTo(ship.x - ship.w / 2, ship.y + ship.h / 2);
    ctx.lineTo(ship.x + ship.w / 2, ship.y + ship.h / 2);
    ctx.closePath();
    ctx.fill();
  },
};

startBtn.addEventListener("click", () => document.getElementById("hudPlay")?.click());
startLoop(game, canvas);
