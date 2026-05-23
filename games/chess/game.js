import { createHud } from "../../shared/game-hud.js";

const PIECES = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const flipBtn = document.getElementById("flipBoard");

let board, turn, selected, legalMoves, flipped, castling, enPassant, moveCount;

const hud = createHud("chess", {
  scoreLabel: "Moves",
  onPlay: () => initBoard(),
  onPause: () => {},
  onReset: () => {
    hud.resetScore();
    initBoard();
    hud.start();
  },
});

hud.loadBest();

function initBoard() {
  moveCount = 0;
  hud.setScore(0);
  const setup = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  board = setup.map((row) => row.map((p) => (p ? { p, moved: false } : null)));
  turn = "w";
  selected = null;
  legalMoves = [];
  flipped = false;
  castling = { wK: true, wQ: true, bK: true, bQ: true };
  enPassant = null;
  render();
  updateStatus();
}

function colorOf(p) {
  return p.p === p.p.toUpperCase() ? "w" : "b";
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function opponent(c) {
  return c === "w" ? "b" : "w";
}

function cloneBoard(b) {
  return b.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function findKing(b, color) {
  const k = color === "w" ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (b[r][c]?.p === k) return [r, c];
    }
  }
  return null;
}

function attacked(b, r, c, byColor) {
  for (let rr = 0; rr < 8; rr++) {
    for (let cc = 0; cc < 8; cc++) {
      const cell = b[rr][cc];
      if (!cell || colorOf(cell) !== byColor) continue;
      const moves = rawMoves(b, rr, cc, true);
      if (moves.some(([mr, mc]) => mr === r && mc === c)) return true;
    }
  }
  return false;
}

function inCheck(b, color) {
  const king = findKing(b, color);
  if (!king) return false;
  return attacked(b, king[0], king[1], opponent(color));
}

function rawMoves(b, r, c, forAttackOnly = false) {
  const cell = b[r][c];
  if (!cell) return [];
  const moves = [];
  const col = colorOf(cell);
  const p = cell.p.toLowerCase();
  const dir = col === "w" ? -1 : 1;

  const add = (nr, nc, capOnly = false) => {
    if (!inBounds(nr, nc)) return;
    const target = b[nr][nc];
    if (!target) {
      if (!capOnly) moves.push([nr, nc]);
    } else if (colorOf(target) !== col) {
      moves.push([nr, nc]);
    }
  };

  const slide = (dirs) => {
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        const target = b[nr][nc];
        if (!target) {
          moves.push([nr, nc]);
        } else {
          if (colorOf(target) !== col) moves.push([nr, nc]);
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  };

  if (p === "p") {
    const startRow = col === "w" ? 6 : 1;
    if (!b[r + dir]?.[c] && !forAttackOnly) {
      moves.push([r + dir, c]);
      if (r === startRow && !b[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      if (b[nr][nc] && colorOf(b[nr][nc]) !== col) moves.push([nr, nc]);
      if (enPassant && enPassant[0] === nr && enPassant[1] === nc) moves.push([nr, nc]);
    }
  } else if (p === "n") {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      add(r + dr, c + dc);
    }
  } else if (p === "b") {
    slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  } else if (p === "r") {
    slide([[-1,0],[1,0],[0,-1],[0,1]]);
  } else if (p === "q") {
    slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
  } else if (p === "k") {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      add(r + dr, c + dc);
    }
    if (!forAttackOnly && !cell.moved && !inCheck(b, col)) {
      const row = col === "w" ? 7 : 0;
      if (castling[col + "K"] && !b[row][5] && !b[row][6] &&
          !attacked(b, row, 4, opponent(col)) && !attacked(b, row, 5, opponent(col)) && !attacked(b, row, 6, opponent(col))) {
        moves.push([row, 6]);
      }
      if (castling[col + "Q"] && !b[row][1] && !b[row][2] && !b[row][3] &&
          !attacked(b, row, 4, opponent(col)) && !attacked(b, row, 3, opponent(col)) && !attacked(b, row, 2, opponent(col))) {
        moves.push([row, 2]);
      }
    }
  }
  return moves;
}

function legalFor(b, r, c) {
  const cell = b[r][c];
  if (!cell || colorOf(cell) !== turn) return [];
  return rawMoves(b, r, c).filter(([nr, nc]) => {
    const nb = cloneBoard(b);
    const moving = nb[r][c];
    const cap = nb[nr][nc];
    if (moving.p.toLowerCase() === "p" && enPassant && nr === enPassant[0] && nc === enPassant[1]) {
      nb[r][nc] = null;
    }
    nb[nr][nc] = moving;
    nb[r][c] = null;
    if (moving.p.toLowerCase() === "k" && Math.abs(nc - c) === 2) {
      const row = r;
      if (nc === 6) { nb[row][5] = moving; nb[row][7] = null; nb[row][6] = null; }
      else { nb[row][3] = moving; nb[row][0] = null; nb[row][2] = null; }
    }
    return !inCheck(nb, turn);
  });
}

function hasAnyLegal(b, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (b[r][c] && colorOf(b[r][c]) === color) {
        const saved = turn;
        turn = color;
        if (legalFor(b, r, c).length) { turn = saved; return true; }
        turn = saved;
      }
    }
  }
  return false;
}

function moveKey(m) {
  return `${m[0]},${m[1]}`;
}

function render() {
  boardEl.innerHTML = "";
  const rows = [...Array(8).keys()];
  const cols = [...Array(8).keys()];
  if (flipped) { rows.reverse(); cols.reverse(); }

  for (const ri of rows) {
    for (const ci of cols) {
      const r = flipped ? 7 - ri : ri;
      const c = flipped ? 7 - ci : ci;
      const cell = board[r][c];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sq " + ((r + c) % 2 === 0 ? "light" : "dark");
      const isSel = selected && selected[0] === r && selected[1] === c;
      const isLegal = legalMoves.some((m) => m[0] === r && m[1] === c);
      if (isSel) btn.classList.add("selected");
      if (isLegal) {
        btn.classList.add("legal");
        if (cell) btn.classList.add("cap");
      }
      const king = cell?.p === "K" || cell?.p === "k";
      if (king && inCheck(board, colorOf(cell))) btn.classList.add("check");
      btn.textContent = cell ? PIECES[cell.p] : "";
      btn.addEventListener("click", () => onClick(r, c));
      boardEl.append(btn);
    }
  }
}

function onClick(r, c) {
  if (!hud.isActive()) return;
  const cell = board[r][c];
  if (selected) {
    const move = legalMoves.find((m) => m[0] === r && m[1] === c);
    if (move) {
      applyMove(selected[0], selected[1], r, c);
      moveCount++;
      hud.setScore(moveCount);
      selected = null;
      legalMoves = [];
      turn = opponent(turn);
      if (inCheck(board, turn)) {
        if (!hasAnyLegal(board, turn)) {
          messageEl.textContent = `Checkmate! ${turn === "w" ? "Black" : "White"} wins.`;
          statusEl.textContent = "Game over";
          hud.saveBest();
          hud.stop();
        } else {
          messageEl.textContent = "Check!";
        }
      } else if (!hasAnyLegal(board, turn)) {
        messageEl.textContent = "Stalemate — draw.";
        statusEl.textContent = "Draw";
        hud.saveBest();
        hud.stop();
      } else {
        messageEl.textContent = "Select a piece to move.";
      }
      updateStatus();
      render();
      return;
    }
  }
  if (cell && colorOf(cell) === turn) {
    selected = [r, c];
    legalMoves = legalFor(board, r, c);
    messageEl.textContent = `${legalMoves.length} legal move(s).`;
  } else {
    selected = null;
    legalMoves = [];
    messageEl.textContent = "Select a piece to move.";
  }
  render();
}

function applyMove(fr, fc, tr, tc) {
  const moving = board[fr][fc];
  const captured = board[tr][tc];
  enPassant = null;

  if (moving.p.toLowerCase() === "p" && fc !== tc && !captured) {
    board[fr][tc] = null;
  }

  if (moving.p.toLowerCase() === "k" && Math.abs(tc - fc) === 2) {
    if (tc === 6) { board[fr][5] = board[fr][7]; board[fr][7] = null; }
    else { board[fr][3] = board[fr][0]; board[fr][0] = null; }
  }

  board[tr][tc] = moving;
  board[fr][fc] = null;
  moving.moved = true;

  if (moving.p.toLowerCase() === "p" && Math.abs(tr - fr) === 2) {
    enPassant = [fr + (tr - fr) / 2, fc];
  }

  if (moving.p.toLowerCase() === "k") {
    castling[colorOf(moving) + "K"] = false;
    castling[colorOf(moving) + "Q"] = false;
  }
  if (moving.p.toLowerCase() === "r") {
    if (fc === 0) castling[colorOf(moving) + "Q"] = false;
    if (fc === 7) castling[colorOf(moving) + "K"] = false;
  }

  if (moving.p.toLowerCase() === "p" && (tr === 0 || tr === 7)) {
    moving.p = colorOf(moving) === "w" ? "Q" : "q";
  }
}

function updateStatus() {
  statusEl.textContent = turn === "w" ? "White to move" : "Black to move";
}

flipBtn.addEventListener("click", () => { flipped = !flipped; render(); });
initBoard();
