import { startLoop } from "../../shared/game-loop.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart");
const msgEl = document.getElementById("msg");

let paddle, ball, bricks, score, w, h, pointerX, won;

function reset() {
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  paddle = { x: w / 2, w: 100, h: 14 };
  ball = { x: w / 2, y: h * 0.65, vx: 220, vy: -280, r: 8 };
  bricks = [];
  const cols = 8;
  const rows = 5;
  const bw = (w - 40) / cols - 6;
  const bh = 22;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bricks.push({
        x: 20 + col * (bw + 6),
        y: 70 + row * (bh + 6),
        w: bw,
        h: bh,
        hue: 200 + row * 18,
        alive: true,
      });
    }
  }
  score = 0;
  won = false;
  hud.setScore(0);
  overlay.classList.add("hidden");
}

const hud = createHud("brick-breaker", {
  onPlay: () => {
    reset();
    game.paused = false;
  },
  onPause: () => {
    game.paused = true;
  },
  onReset: () => {
    hud.resetScore();
    reset();
    hud.start();
  },
});

hud.loadBest();

canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  pointerX = e.clientX - rect.left;
});

const game = {
  paused: false,
  _keys: { left: false, right: false },
  update(dt) {
    if (!hud.isActive() || won) return;

    if (pointerX != null) paddle.x = pointerX;
    else {
      if (game._keys.left) paddle.x -= 420 * dt;
      if (game._keys.right) paddle.x += 420 * dt;
    }
    paddle.x = Math.max(paddle.w / 2, Math.min(w - paddle.w / 2, paddle.x));

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x - ball.r < 0) {
      ball.x = ball.r;
      ball.vx *= -1;
    }
    if (ball.x + ball.r > w) {
      ball.x = w - ball.r;
      ball.vx *= -1;
    }
    if (ball.y - ball.r < 50) {
      ball.y = 50 + ball.r;
      ball.vy *= -1;
    }

    const py = h - 50;
    if (
      ball.y + ball.r >= py - paddle.h &&
      ball.y - ball.r <= py &&
      ball.x > paddle.x - paddle.w / 2 &&
      ball.x < paddle.x + paddle.w / 2 &&
      ball.vy > 0
    ) {
      ball.y = py - paddle.h - ball.r;
      ball.vy = -Math.abs(ball.vy);
      const hit = (ball.x - paddle.x) / (paddle.w / 2);
      ball.vx = hit * 320;
    }

    if (ball.y > h) {
      hud.setScore(score);
      hud.saveBest();
      hud.stop();
      msgEl.textContent = "Ball lost!";
      overlay.classList.remove("hidden");
      return;
    }

    for (const b of bricks) {
      if (!b.alive) continue;
      if (
        ball.x + ball.r > b.x &&
        ball.x - ball.r < b.x + b.w &&
        ball.y + ball.r > b.y &&
        ball.y - ball.r < b.y + b.h
      ) {
        b.alive = false;
        ball.vy *= -1;
        score += 10;
        hud.setScore(score);
        break;
      }
    }
    bricks = bricks.filter((b) => b.alive);

    if (!bricks.length) {
      won = true;
      hud.setScore(score);
      hud.saveBest();
      hud.stop();
      msgEl.textContent = "You win!";
      overlay.classList.remove("hidden");
    }
  },
  draw(ctx, cw, ch) {
    w = cw;
    h = ch;
    ctx.fillStyle = "#0c4a6e";
    ctx.fillRect(0, 0, cw, ch);
    for (const b of bricks) {
      if (!b.alive) continue;
      ctx.fillStyle = `hsl(${b.hue} 80% 55%)`;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    const py = ch - 50;
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(paddle.x - paddle.w / 2, py, paddle.w, paddle.h);
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  },
};

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") game._keys.left = true;
  if (e.key === "ArrowRight") game._keys.right = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") game._keys.left = false;
  if (e.key === "ArrowRight") game._keys.right = false;
});

restartBtn.addEventListener("click", () => {
  reset();
  hud.start();
});

reset();
startLoop(game, canvas);
