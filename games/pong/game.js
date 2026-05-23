import { startLoop } from "../../shared/game-loop.js";
import { isDown } from "../../shared/input.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");

const WIN = 5;
let w, h, ball, p1, p2, s1, s2;

const hud = createHud("pong", {
  scoreLabel: "P1",
  bestLabel: "Best P1",
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

function resetBall(dir = 1) {
  ball = {
    x: w / 2,
    y: h / 2,
    vx: 260 * dir,
    vy: (Math.random() - 0.5) * 200,
    r: 8,
  };
}

function reset() {
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  p1 = { y: h / 2, h: 80, w: 12 };
  p2 = { y: h / 2, h: 80, w: 12 };
  s1 = 0;
  s2 = 0;
  hud.setScore(0);
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

function updateScoreDisplay() {
  document.getElementById("score").textContent = `${s1} - ${s2}`;
}

const game = {
  paused: false,
  update(dt) {
    if (!hud.isActive()) return;
    const pad = 14;
    if (isDown("w")) p1.y -= 360 * dt;
    if (isDown("s")) p1.y += 360 * dt;
    if (isDown("arrowup")) p2.y -= 360 * dt;
    if (isDown("arrowdown")) p2.y += 360 * dt;

    const clamp = (p) => {
      p.y = Math.max(p.h / 2 + 50, Math.min(h - p.h / 2 - 20, p.y));
    };
    clamp(p1);
    clamp(p2);

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.y - ball.r < 50) {
      ball.y = 50 + ball.r;
      ball.vy *= -1;
    }
    if (ball.y + ball.r > h - 20) {
      ball.y = h - 20 - ball.r;
      ball.vy *= -1;
    }

    const hit = (px, p) => {
      if (
        ball.x - ball.r < px + p.w &&
        ball.x + ball.r > px &&
        ball.y > p.y - p.h / 2 &&
        ball.y < p.y + p.h / 2
      ) {
        ball.x = px + p.w + ball.r;
        ball.vx = Math.abs(ball.vx) * 1.05;
        ball.vy += (ball.y - p.y) * 4;
      }
    };
    hit(24, p1);
    if (
      ball.x + ball.r > w - 24 - p2.w &&
      ball.x - ball.r < w - 24 &&
      ball.y > p2.y - p2.h / 2 &&
      ball.y < p2.y + p2.h / 2
    ) {
      ball.x = w - 24 - p2.w - ball.r;
      ball.vx = -Math.abs(ball.vx) * 1.05;
      ball.vy += (ball.y - p2.y) * 4;
    }

    if (ball.x < 0) {
      s2++;
      updateScoreDisplay();
      resetBall(1);
    }
    if (ball.x > w) {
      s1++;
      hud.setScore(s1);
      updateScoreDisplay();
      resetBall(-1);
    }

    if (s1 >= WIN) {
      hud.saveBest();
      s1 = 0;
      s2 = 0;
      hud.setScore(0);
      updateScoreDisplay();
      resetBall();
    }
  },
  draw(ctx, cw, ch) {
    w = cw;
    h = ch;
    ctx.fillStyle = "#422006";
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = "#78716c";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(cw / 2, 50);
    ctx.lineTo(cw / 2, ch);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fef9c3";
    ctx.fillRect(24, p1.y - p1.h / 2, p1.w, p1.h);
    ctx.fillRect(cw - 24 - p2.w, p2.y - p2.h / 2, p2.w, p2.h);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  },
};

reset();
startLoop(game, canvas);
