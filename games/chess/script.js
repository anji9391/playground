const chessboard = document.getElementById("chessboard");
const turnIndicator = document.getElementById("turnIndicator");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect");
const difficultySelect = document.getElementById("difficultySelect");

let currentTurn = "white";
let selectedSquare = null;
let possibleMoves = [];
let gameMode = "pvp";

const pieceImages = {
  white: {
    king: "assets/pieces/white-king.png",
    queen: "assets/pieces/white-queen.png",
    rook: "assets/pieces/white-rook.png",
    bishop: "assets/pieces/white-bishop.png",
    knight: "assets/pieces/white-knight.png",
    pawn: "assets/pieces/white-pawn.png",
  },
  black: {
    king: "assets/pieces/black-king.png",
    queen: "assets/pieces/black-queen.png",
    rook: "assets/pieces/black-rook.png",
    bishop: "assets/pieces/black-bishop.png",
    knight: "assets/pieces/black-knight.png",
    pawn: "assets/pieces/black-pawn.png",
  },
};

let board = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  Array(8).fill({ type: "pawn", color: "black" }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: "pawn", color: "white" }),
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
];
function createBoard() {

  chessboard.innerHTML = "";

  for (
    let row = 0;
    row < 8;
    row++
  ) {

    for (
      let col = 0;
      col < 8;
      col++
    ) {

      const square =
        document.createElement(
          "div"
        );

      square.className =
        "square";

      const isLight =
        (row + col) % 2 === 0;

      square.classList.add(
        isLight
          ? "light"
          : "dark"
      );

      square.dataset.row =
        row;

      square.dataset.col =
        col;

      const piece =
        board[row][col];

      if (piece) {

        const img =
          document.createElement(
            "img"
          );

        img.src =
          pieceImages[
            piece.color
          ][piece.type];

        img.className =
          "piece";

        img.draggable =
          false;

        square.appendChild(
          img
        );
      }

      /* BETTER MOBILE TOUCH */
      square.addEventListener(
        "touchstart",
        handleSquareClick,
        { passive: true }
      );

      square.addEventListener(
        "click",
        handleSquareClick
      );

      chessboard.appendChild(
        square
      );
    }
  }

  updateTurnIndicator();
}

function handleSquareClick(e) {

  const square =
    e.currentTarget;

  const row = Number(
    square.dataset.row
  );

  const col = Number(
    square.dataset.col
  );

  const clickedPiece =
    board[row][col];

  /* MOVE PIECE */
  if (selectedSquare) {

    const validMove =
      possibleMoves.find(
        move =>
          move.row === row &&
          move.col === col
      );

    if (validMove) {

      movePiece(
        selectedSquare.row,
        selectedSquare.col,
        row,
        col
      );

      selectedSquare = null;
      possibleMoves = [];

      clearHighlights();

      return;
    }
  }

  /* SELECT PIECE */
  if (
    clickedPiece &&
    clickedPiece.color ===
    currentTurn
  ) {

    selectedSquare = {
      row,
      col
    };

    clearHighlights();

    square.classList.add(
      "selected"
    );

    possibleMoves =
      getLegalMoves(
        row,
        col,
        clickedPiece
      );

    highlightMoves(
      possibleMoves
    );
  }
}
function movePiece(
  fromRow,
  fromCol,
  toRow,
  toCol
) {

  const captured =
    board[toRow][toCol];

  if (captured) {
    updateCaptured(
      captured
    );

    if (
      captured.type ===
      "king"
    ) {

      setTimeout(() => {

        alert(
          `${
            currentTurn ===
            "white"
              ? "White"
              : "Black"
          } Wins!`
        );

      }, 150);
    }
  }

  board[toRow][toCol] =
    board[fromRow][fromCol];

  board[fromRow][fromCol] =
    null;

  currentTurn =
    currentTurn ===
    "white"
      ? "black"
      : "white";

  selectedSquare =
    null;

  possibleMoves = [];

  createBoard();

  /* BOT MOVE */
  if (
    modeSelect.value ===
      "bot" &&
    currentTurn ===
      "black"
  ) {

    setTimeout(
      botMove,
      450
    );
  }
}

function highlightMoves(moves) {
  moves.forEach((move) => {
    const square =
      document.querySelector(
        `[data-row="${move.row}"][data-col="${move.col}"]`
      );

    if (square) {
      square.classList.add(
        "highlight"
      );
    }
  });
}

function clearHighlights() {
  document
    .querySelectorAll(".square")
    .forEach((sq) => {
      sq.classList.remove(
        "selected",
        "highlight"
      );
    });
}

function updateTurnIndicator() {
  turnIndicator.textContent =
    currentTurn === "white"
      ? "White's Turn"
      : "Black's Turn";
}

resetBtn.addEventListener(
  "click",
  () => {
    location.reload();
  }
);

modeSelect.addEventListener(
  "change",
  () => {
    gameMode = modeSelect.value;
  }
);

createBoard();
function getLegalMoves(row, col, piece) {
  switch (piece.type) {
    case "pawn":
      return getPawnMoves(row, col, piece);

    case "rook":
      return getStraightMoves(row, col, piece);

    case "bishop":
      return getDiagonalMoves(row, col, piece);

    case "queen":
      return [
        ...getStraightMoves(row, col, piece),
        ...getDiagonalMoves(row, col, piece),
      ];

    case "knight":
      return getKnightMoves(row, col, piece);

    case "king":
      return getKingMoves(row, col, piece);

    default:
      return [];
  }
}

/* ---------- Pawn ---------- */
function getPawnMoves(row, col, piece) {
  const moves = [];
  const dir =
    piece.color === "white" ? -1 : 1;

  const startRow =
    piece.color === "white" ? 6 : 1;

  // Forward
  if (isInside(row + dir, col) &&
      !board[row + dir][col]) {

    moves.push({
      row: row + dir,
      col
    });

    // Double move
    if (
      row === startRow &&
      !board[row + dir * 2][col]
    ) {
      moves.push({
        row: row + dir * 2,
        col
      });
    }
  }

  // Capture
  [-1, 1].forEach((offset) => {
    const newCol = col + offset;

    if (
      isInside(row + dir, newCol)
    ) {
      const target =
        board[row + dir][newCol];

      if (
        target &&
        target.color !== piece.color
      ) {
        moves.push({
          row: row + dir,
          col: newCol
        });
      }
    }
  });

  return moves;
}

/* ---------- Straight ---------- */
function getStraightMoves(
  row,
  col,
  piece
) {
  const moves = [];

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  directions.forEach(
    ([dr, dc]) => {
      let r = row + dr;
      let c = col + dc;

      while (isInside(r, c)) {

        const target = board[r][c];

        if (!target) {
          moves.push({
            row: r,
            col: c
          });
        } else {
          if (
            target.color !== piece.color
          ) {
            moves.push({
              row: r,
              col: c
            });
          }
          break;
        }

        r += dr;
        c += dc;
      }
    }
  );

  return moves;
}

/* ---------- Diagonal ---------- */
function getDiagonalMoves(
  row,
  col,
  piece
) {
  const moves = [];

  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ];

  directions.forEach(
    ([dr, dc]) => {
      let r = row + dr;
      let c = col + dc;

      while (isInside(r, c)) {

        const target = board[r][c];

        if (!target) {
          moves.push({
            row: r,
            col: c
          });
        } else {
          if (
            target.color !== piece.color
          ) {
            moves.push({
              row: r,
              col: c
            });
          }
          break;
        }

        r += dr;
        c += dc;
      }
    }
  );

  return moves;
}

/* ---------- Knight ---------- */
function getKnightMoves(
  row,
  col,
  piece
) {
  const moves = [];

  const knightOffsets = [
    [-2, -1],
    [-2, 1],
    [2, -1],
    [2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2]
  ];

  knightOffsets.forEach(
    ([dr, dc]) => {

      const r = row + dr;
      const c = col + dc;

      if (!isInside(r, c)) return;

      const target = board[r][c];

      if (
        !target ||
        target.color !== piece.color
      ) {
        moves.push({
          row: r,
          col: c
        });
      }
    }
  );

  return moves;
}

/* ---------- King ---------- */
function getKingMoves(
  row,
  col,
  piece
) {
  const moves = [];

  for (
    let dr = -1;
    dr <= 1;
    dr++
  ) {
    for (
      let dc = -1;
      dc <= 1;
      dc++
    ) {

      if (
        dr === 0 &&
        dc === 0
      )
        continue;

      const r = row + dr;
      const c = col + dc;

      if (!isInside(r, c))
        continue;

      const target =
        board[r][c];

      if (
        !target ||
        target.color !== piece.color
      ) {
        moves.push({
          row: r,
          col: c
        });
      }
    }
  }

  return moves;
}

/* ---------- Utility ---------- */
function isInside(row, col) {
  return (
    row >= 0 &&
    row < 8 &&
    col >= 0 &&
    col < 8
  );
}
/* ========= BOT AI ========= */

function botMove() {
  const allMoves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {

      const piece = board[row][col];

      if (
        piece &&
        piece.color === "black"
      ) {

        const moves =
          getLegalMoves(
            row,
            col,
            piece
          );

        moves.forEach((move) => {
          allMoves.push({
            fromRow: row,
            fromCol: col,
            toRow: move.row,
            toCol: move.col,
            piece,
            target:
              board[move.row][move.col]
          });
        });
      }
    }
  }

  if (!allMoves.length) {
    alert("White Wins!");
    return;
  }

  const difficulty =
    difficultySelect.value;

  let chosenMove;

  if (difficulty === "easy") {
    chosenMove =
      easyBot(allMoves);

  } else if (
    difficulty === "medium"
  ) {
    chosenMove =
      mediumBot(allMoves);

  } else {
    chosenMove =
      hardBot(allMoves);
  }

  movePiece(
    chosenMove.fromRow,
    chosenMove.fromCol,
    chosenMove.toRow,
    chosenMove.toCol
  );
}

/* ========= EASY ========= */

function easyBot(moves) {
  return moves[
    Math.floor(
      Math.random() *
      moves.length
    )
  ];
}

/* ========= MEDIUM ========= */

function mediumBot(moves) {

  const captureMoves =
    moves.filter(
      (m) => m.target
    );

  if (
    captureMoves.length
  ) {
    return captureMoves[
      Math.floor(
        Math.random() *
        captureMoves.length
      )
    ];
  }

  return easyBot(moves);
}

/* ========= HARD ========= */

function hardBot(moves) {

  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100
  };

  let bestMove = null;
  let bestScore = -999;

  moves.forEach((move) => {

    let score = 0;

    if (move.target) {
      score +=
        pieceValues[
          move.target.type
        ];
    }

    // Center control
    if (
      move.toRow >= 2 &&
      move.toRow <= 5 &&
      move.toCol >= 2 &&
      move.toCol <= 5
    ) {
      score += 2;
    }

    if (
      score >
      bestScore
    ) {
      bestScore = score;
      bestMove = move;
    }
  });

  return (
    bestMove ||
    easyBot(moves)
  );
}

/* ========= CAPTURES ========= */

function updateCaptured(
  piece
) {
  if (!piece) return;

  const img =
    document.createElement(
      "img"
    );

  img.src =
    pieceImages[
      piece.color
    ][piece.type];

  if (
    piece.color ===
    "white"
  ) {
    document
      .getElementById(
        "whiteCaptured"
      )
      .appendChild(img);
  } else {
    document
      .getElementById(
        "blackCaptured"
      )
      .appendChild(img);
  }
}

/* ========= OVERRIDE MOVE ========= */

const originalMovePiece =
  movePiece;

movePiece = function (
  fromRow,
  fromCol,
  toRow,
  toCol
) {

  const captured =
    board[toRow][toCol];

  if (captured) {
    updateCaptured(
      captured
    );

    if (
      captured.type ===
      "king"
    ) {
      alert(
        `${
          currentTurn ===
          "white"
            ? "White"
            : "Black"
        } Wins!`
      );
    }
  }

  originalMovePiece(
    fromRow,
    fromCol,
    toRow,
    toCol
  );
};

/* ========= RESET ========= */

resetBtn.addEventListener(
  "click",
  () => {

    board = [
      [
        { type: "rook", color: "black" },
        { type: "knight", color: "black" },
        { type: "bishop", color: "black" },
        { type: "queen", color: "black" },
        { type: "king", color: "black" },
        { type: "bishop", color: "black" },
        { type: "knight", color: "black" },
        { type: "rook", color: "black" }
      ],
      Array(8).fill({
        type: "pawn",
        color: "black"
      }),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill({
        type: "pawn",
        color: "white"
      }),
      [
        { type: "rook", color: "white" },
        { type: "knight", color: "white" },
        { type: "bishop", color: "white" },
        { type: "queen", color: "white" },
        { type: "king", color: "white" },
        { type: "bishop", color: "white" },
        { type: "knight", color: "white" },
        { type: "rook", color: "white" }
      ]
    ];

    currentTurn =
      "white";

    document.getElementById(
      "whiteCaptured"
    ).innerHTML = "";

    document.getElementById(
      "blackCaptured"
    ).innerHTML = "";

    createBoard();
  }
);