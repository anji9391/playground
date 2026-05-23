import { startLoop } from "../../shared/game-loop.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart");

let cx, cy, R, coins, striker, drag, aim, potted, shots;
let hud;

function layout() {
  const w = canvas.clientWidth || 400;
  const h = canvas.clientHeight || 400;
  cx = w / 2;
  cy = h / 2;
  R = Math.min(w, h) * 0.44;
}

function resetBoard() {
  layout();
  overlay.classList.add("hidden");
  potted = 0;
  shots = 0;
  coins = [];
  const queen = { x: cx, y: cy, r: 13, vx: 0, vy: 0, alive: true, queen: true };
  coins.push(queen);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    coins.push({
      x: cx + Math.cos(a) * 55,
      y: cy + Math.sin(a) * 55,
      r: 12,
      vx: 0,
      vy: 0,
      alive: true,
      queen: false,
    });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6;
    coins.push({
      x: cx + Math.cos(a) * 95,
      y: cy + Math.sin(a) * 95,
      r: 12,
      vx: 0,
      vy: 0,
      alive: true,
      queen: false,
    });
  }
  striker = { x: cx, y: cy + R * 0.62, r: 20, vx: 0, vy: 0 };
  drag = null;
  aim = null;
  hud.setScore(0);
  hud.setBest(Math.max(hud.best, potted));
}

function pockets() {
  return [
    [cx - R * 0.95, cy - R * 0.95],
    [cx + R * 0.95, cy - R * 0.95],
    [cx - R * 0.95, cy + R * 0.95],
    [cx + R * 0.95, cy + R * 0.95],
  ];
}

function pocket(x, y) {
  for (const [px, py] of pockets()) {
    if (Math.hypot(x - px, y - py) < 24) return true;
  }
  return false;
}

function collide(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const min = a.r + b.r;
  if (dist >= min || dist === 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = min - dist;
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;
  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const imp = (dvx * nx + dvy * ny) * 0.92;
  a.vx -= imp * nx;
  a.vy -= imp * ny;
  b.vx += imp * nx;
  b.vy += imp * ny;
}

function keepInDisk(o) {
  const d = Math.hypot(o.x - cx, o.y - cy);
  const max = R - o.r - 10;
  if (d > max) {
    const a = Math.atan2(o.y - cy, o.x - cx);
    o.x = cx + Math.cos(a) * max;
    o.y = cy + Math.sin(a) * max;
    o.vx *= -0.55;
    o.vy *= -0.55;
  }
}

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function allStopped() {
  const all = [...coins.filter((c) => c.alive), striker];
  return all.every((o) => Math.hypot(o.vx, o.vy) < 8);
}

canvas.addEventListener("pointerdown", (e) => {
  if (!hud.isActive() || !allStopped()) return;
  const p = pointerPos(e);
  if (Math.hypot(p.x - striker.x, p.y - striker.y) < striker.r + 12) {
    drag = { ox: p.x - striker.x, oy: p.y - striker.y, sx: p.x, sy: p.y };
    striker.vx = striker.vy = 0;
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const p = pointerPos(e);
  striker.x = p.x - drag.ox;
  striker.y = p.y - drag.oy;
  const baseY = cy + R * 0.62;
  striker.y = Math.max(baseY - 30, Math.min(baseY + 10, striker.y));
  striker.x = Math.max(cx - R * 0.5, Math.min(cx + R * 0.5, striker.x));
  aim = { x: drag.sx - p.x, y: drag.sy - p.y };
});

canvas.addEventListener("pointerup", (e) => {
  if (!drag) return;
  const p = pointerPos(e);
  striker.vx = (drag.sx - p.x) * 5;
  striker.vy = (drag.sy - p.y) * 5;
  drag = null;
  aim = null;
  shots++;
});

function checkWin() {
  const left = coins.filter((c) => c.alive).length;
  if (left === 0) {
    hud.saveBest();
    overlay.classList.remove("hidden");
    hud.stop();
  }
}

const game = {
  paused: false,
  update(dt) {
    if (!hud.isActive() || drag) return;
    const friction = Math.pow(0.9, dt * 60);
    const all = [...coins.filter((c) => c.alive), striker];
    for (const o of all) {
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.vx *= friction;
      o.vy *= friction;
      keepInDisk(o);
      if (o !== striker && o.alive && pocket(o.x, o.y)) {
        o.alive = false;
        potted++;
        hud.setScore(potted);
        if (o.queen) hud.addScore(2);
      }
    }
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        if (all[i].alive !== false && all[j].alive !== false) collide(all[i], all[j]);
      }
    }
    if (allStopped() && shots > 0) checkWin();
  },
  draw(ctx, w, h) {
    layout();
    ctx.fillStyle = "#3d2817";
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, R + 14, 0, Math.PI * 2);
    ctx.fillStyle = "#78350f";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const wood = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
    wood.addColorStop(0, "#fde68a");
    wood.addColorStop(1, "#d4a574");
    ctx.fillStyle = wood;
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 8;
    ctx.stroke();

    for (const [px, py] of pockets()) {
      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(146, 64, 14, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 2;
    const baseY = cy + R * 0.62;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.55, baseY);
    ctx.lineTo(cx + R * 0.55, baseY);
    ctx.stroke();

    for (const c of coins) {
      if (!c.alive) continue;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = c.queen ? "#dc2626" : "#fef9c7";
      ctx.fill();
      ctx.strokeStyle = c.queen ? "#991b1b" : "#ca8a04";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(striker.x, striker.y, striker.r, 0, Math.PI * 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (aim && drag) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(striker.x, striker.y);
      ctx.lineTo(striker.x + aim.x * 2.5, striker.y + aim.y * 2.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
};

hud = createHud("carrom", {
  scoreLabel: "Potted",
  onPlay: () => {
    wrapped.paused = false;
    resetBoard();
    hud.start();
  },
  onPause: () => {
    wrapped.paused = true;
  },
  onReset: () => {
    wrapped.paused = false;
    hud.resetScore();
    resetBoard();
    hud.start();
  },
});

hud.loadBest();
restartBtn.addEventListener("click", () => {
  resetBoard();
  hud.start();
});

const wrapped = {
  paused: false,
  update(dt) {
    if (game.paused || hud.paused) return;
    game.update(dt);
  },
  draw: game.draw,
};

startLoop(wrapped, canvas);
requestAnimationFrame(() => resetBoard());
