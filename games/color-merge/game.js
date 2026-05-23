import { startLoop } from "../../shared/game-loop.js";
import { createHud } from "../../shared/game-hud.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart");

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "linear",
];

const SIZE = 4;
let grid, peakLevel, anim;

const hud = createHud("color-merge", {
  scoreLabel: "Peak",
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

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function updateScoreDisplay() {
  const val = 2 ** peakLevel;
  hud.setScore(val);
}

function reset() {
  grid = emptyGrid();
  peakLevel = 1;
  anim = null;
  addTile();
  addTile();
  overlay.classList.add("hidden");
  updateScoreDisplay();
}

function addTile() {
  const empty = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (grid[y][x] === 0) empty.push({ x, y });
    }
  }
  if (!empty.length) return;
  const { x, y } = empty[Math.floor(Math.random() * empty.length)];
  grid[y][x] = Math.random() < 0.85 ? 1 : 2;
}

function slide(row) {
  const vals = row.filter((v) => v > 0);
  const out = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      const merged = vals[i] + 1;
      out.push(merged);
      gained += merged;
      i++;
    } else {
      out.push(vals[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

function move(dir) {
  if (anim || !hud.isActive()) return;
  const next = emptyGrid();
  let moved = false;
  let gained = 0;

  if (dir === "left" || dir === "right") {
    for (let y = 0; y < SIZE; y++) {
      let row = [...grid[y]];
      if (dir === "right") row.reverse();
      const { row: slid, gained: g } = slide(row);
      gained += g;
      if (dir === "right") slid.reverse();
      for (let x = 0; x < SIZE; x++) {
        if (grid[y][x] !== slid[x]) moved = true;
        next[y][x] = slid[x];
      }
    }
  } else {
    for (let x = 0; x < SIZE; x++) {
      let col = grid.map((r) => r[x]);
      if (dir === "down") col.reverse();
      const { row: slid, gained: g } = slide(col);
      gained += g;
      if (dir === "down") slid.reverse();
      for (let y = 0; y < SIZE; y++) {
        if (grid[y][x] !== slid[y]) moved = true;
        next[y][x] = slid[y];
      }
    }
  }

  if (!moved) return;
  grid = next;
  if (gained > 0) {
    peakLevel = Math.max(peakLevel, gained);
    updateScoreDisplay();
    if (peakLevel >= COLORS.length - 1) {
      hud.setScore(2 ** peakLevel);
      hud.saveBest();
      hud.stop();
      overlay.classList.remove("hidden");
    }
  }
  addTile();
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "arrowleft") move("left");
  if (k === "arrowright") move("right");
  if (k === "arrowup") move("up");
  if (k === "arrowdown") move("down");
});

let touchStart = null;
canvas.addEventListener("pointerdown", (e) => {
  touchStart = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("pointerup", (e) => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  if (Math.hypot(dx, dy) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
  else move(dy > 0 ? "down" : "up");
  touchStart = null;
});

function tileColor(level) {
  if (level >= COLORS.length) {
    return "linear-gradient(135deg,#f472b6,#818cf8,#34d399)";
  }
  return COLORS[level - 1] ?? "#334155";
}

const game = {
  paused: false,
  update() {},
  draw(ctx, w, h) {
    const pad = 16;
    const top = 48;
    const side = Math.min(w, h - top) - pad * 2;
    const cell = side / SIZE;
    const ox = (w - side) / 2;
    const oy = top + (h - top - side) / 2;

    ctx.fillStyle = "#2e1065";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#4c1d95";
    roundRect(ctx, ox - 8, oy - 8, side + 16, side + 16, 12);
    ctx.fill();

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = grid[y][x];
        const cx = ox + x * cell + 6;
        const cy = oy + y * cell + 6;
        const sz = cell - 12;
        if (v === 0) {
          ctx.fillStyle = "#5b21b6";
          roundRect(ctx, cx, cy, sz, sz, 8);
          ctx.fill();
          continue;
        }
        const grad = tileColor(v);
        if (typeof grad === "string" && grad.startsWith("linear")) {
          const g = ctx.createLinearGradient(cx, cy, cx + sz, cy + sz);
          g.addColorStop(0, "#f472b6");
          g.addColorStop(0.5, "#818cf8");
          g.addColorStop(1, "#34d399");
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = grad;
        }
        roundRect(ctx, cx, cy, sz, sz, 8);
        ctx.fill();
        ctx.fillStyle = v >= 5 ? "#fff" : "#1e1b4b";
        ctx.font = `bold ${Math.floor(sz * 0.4)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(2 ** v), cx + sz / 2, cy + sz / 2);
      }
    }
  },
};

function roundRect(ctx, x, y, rw, rh, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + rw, y, x + rw, y + rh, r);
  ctx.arcTo(x + rw, y + rh, x, y + rh, r);
  ctx.arcTo(x, y + rh, x, y, r);
  ctx.arcTo(x, y, x + rw, y, r);
  ctx.closePath();
}

restartBtn.addEventListener("click", () => {
  reset();
  hud.start();
});

reset();
startLoop(game, canvas);
