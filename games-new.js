let currentGame = null;
let gameMode = "ai";

document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleDesktop = document.getElementById(
    "sidebar-toggle-desktop"
  );
  const sidebarToggleMobile = document.getElementById("sidebar-toggle-mobile");

  function toggleSidebar() {
    sidebar.classList.toggle("open");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
  }

  if (sidebarToggleDesktop)
    sidebarToggleDesktop.addEventListener("click", toggleSidebar);
  if (sidebarToggleMobile)
    sidebarToggleMobile.addEventListener("click", toggleSidebar);

  // Escape key to close sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  // Click outside sidebar to close it
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !sidebarToggleDesktop?.contains(e.target) &&
      !sidebarToggleMobile?.contains(e.target)
    ) {
      closeSidebar();
    }
  });

  // Apply mood theme
  const savedMood = localStorage.getItem("mood") || "neutral";
  document.body.className = savedMood;

  // Game card selection
  const gameCards = document.querySelectorAll(".game-card");
  gameCards.forEach((card) => {
    card.addEventListener("click", () => {
      currentGame = card.dataset.game;
      showGame(currentGame);
    });
  });

  // Back buttons
  const backBtns = document.querySelectorAll(".back-btn");
  backBtns.forEach((btn) => {
    btn.addEventListener("click", showGameList);
  });

  // Mode selection buttons
  const modeBtns = document.querySelectorAll(".mode-btn");
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      gameMode = btn.dataset.mode;
      resetCurrentGame();
    });
  });

  // Reset buttons
  const resetBtns = document.querySelectorAll(".reset-btn");
  resetBtns.forEach((btn) => {
    btn.addEventListener("click", resetCurrentGame);
  });

  // Initialize games
  initTicTacToe();
  initMemoryGame();
  initSudoku();
  initWordSearch();
});

function showGame(game) {
  document.getElementById("game-container").style.display = "none";
  document.querySelectorAll(".game-section").forEach((section) => {
    section.classList.add("hidden");
  });
  document.getElementById(game).classList.remove("hidden");
}

function showGameList() {
  document.getElementById("game-container").style.display = "block";
  document.querySelectorAll(".game-section").forEach((section) => {
    section.classList.add("hidden");
  });
}

// ============ TIC TAC TOE ============
let tictactoeState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  gameOver: false,
};

function initTicTacToe() {
  const cells = document.querySelectorAll("#tic-tac-toe .cell");
  cells.forEach((cell) => {
    cell.addEventListener("click", handleTicTacToeMove);
  });
  resetTicTacToe();
}

function handleTicTacToeMove(e) {
  if (tictactoeState.gameOver) return;

  const index = e.target.dataset.index;
  if (tictactoeState.board[index]) return;

  tictactoeState.board[index] = "X";
  renderTicTacToe();

  if (checkTicTacToeWinner("X")) {
    showTicTacToeResult("You win! 🎉");
    tictactoeState.gameOver = true;
    return;
  }

  if (tictactoeState.board.every((cell) => cell)) {
    showTicTacToeResult("It's a draw! 🤝");
    tictactoeState.gameOver = true;
    return;
  }

  if (gameMode === "ai") {
    setTimeout(makeAIMove, 500);
  }
}

function makeAIMove() {
  const availableMoves = tictactoeState.board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);

  if (availableMoves.length === 0) return;

  const bestMove = getBestTicTacToeMove(availableMoves);
  tictactoeState.board[bestMove] = "O";
  renderTicTacToe();

  if (checkTicTacToeWinner("O")) {
    showTicTacToeResult("AI wins! 🤖");
    tictactoeState.gameOver = true;
    return;
  }

  if (tictactoeState.board.every((cell) => cell)) {
    showTicTacToeResult("It's a draw! 🤝");
    tictactoeState.gameOver = true;
  }
}

function getBestTicTacToeMove(moves) {
  // Simple AI: prioritize center, then corners
  if (moves.includes(4)) return 4;
  const corners = [0, 2, 6, 8].filter((m) => moves.includes(m));
  if (corners.length > 0)
    return corners[Math.floor(Math.random() * corners.length)];
  return moves[Math.floor(Math.random() * moves.length)];
}

function checkTicTacToeWinner(player) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return wins.some((combo) =>
    combo.every((i) => tictactoeState.board[i] === player)
  );
}

function renderTicTacToe() {
  const cells = document.querySelectorAll("#tic-tac-toe .cell");
  cells.forEach((cell, idx) => {
    cell.textContent = tictactoeState.board[idx] || "";
  });
}

function showTicTacToeResult(message) {
  document.querySelector("#tic-tac-toe .game-result").textContent = message;
  recordGameResult("tictactoe", message);
}

function resetTicTacToe() {
  tictactoeState = {
    board: Array(9).fill(null),
    currentPlayer: "X",
    gameOver: false,
  };
  renderTicTacToe();
  document.querySelector("#tic-tac-toe .game-result").textContent = "";
}

function resetCurrentGame() {
  if (currentGame === "tic-tac-toe") resetTicTacToe();
  else if (currentGame === "memory") initMemoryGame();
  else if (currentGame === "sudoku") resetSudoku();
  else if (currentGame === "word-search") initWordSearch();
}

// ============ MEMORY GAME ============
let memoryState = {
  cards: [],
  flipped: [],
  matched: [],
  moves: 0,
  startTime: null,
};

function initMemoryGame() {
  const board = document.querySelector("#memory-game .memory-board");
  const animals = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
  memoryState.cards = [...animals, ...animals].sort(() => Math.random() - 0.5);
  memoryState.flipped = [];
  memoryState.matched = [];
  memoryState.moves = 0;
  memoryState.startTime = Date.now();

  board.innerHTML = "";
  memoryState.cards.forEach((card, idx) => {
    const div = document.createElement("div");
    div.className = "memory-card";
    div.dataset.value = card;
    div.dataset.index = idx;
    div.addEventListener("click", flipMemoryCard);
    board.appendChild(div);
  });

  updateMemoryStats();
}

function flipMemoryCard(e) {
  if (memoryState.flipped.length >= 2) return;
  if (memoryState.matched.includes(e.target.dataset.index)) return;

  e.target.classList.add("flipped");
  e.target.textContent = e.target.dataset.value;
  memoryState.flipped.push(e.target);

  if (memoryState.flipped.length === 2) {
    memoryState.moves++;
    updateMemoryStats();
    setTimeout(checkMemoryMatch, 500);
  }
}

function checkMemoryMatch() {
  const [card1, card2] = memoryState.flipped;
  if (card1.dataset.value === card2.dataset.value) {
    memoryState.matched.push(card1.dataset.index, card2.dataset.index);
    if (memoryState.matched.length === memoryState.cards.length) {
      const time = Math.floor((Date.now() - memoryState.startTime) / 1000);
      document.querySelector(
        "#memory-game .game-result"
      ).textContent = `You won in ${memoryState.moves} moves and ${time}s! 🎉`;
      recordGameResult("memory", `Won in ${memoryState.moves} moves`);
    }
  } else {
    card1.classList.remove("flipped");
    card1.textContent = "";
    card2.classList.remove("flipped");
    card2.textContent = "";
  }
  memoryState.flipped = [];
}

function updateMemoryStats() {
  document.getElementById("memory-moves").textContent = memoryState.moves;
  const time = Math.floor((Date.now() - memoryState.startTime) / 1000);
  document.getElementById("memory-time").textContent = time + "s";
}

// ============ SUDOKU ============
let sudokuState = {
  puzzle: [],
  solution: [],
  userInput: [],
};

function initSudoku() {
  const puzzle = generateSudoku();
  sudokuState.puzzle = puzzle.map((row) => [...row]);
  sudokuState.solution = puzzle.map((row) => [...row]);
  solveSudokuPuzzle(sudokuState.solution);
  sudokuState.userInput = puzzle.map((row) => [...row]);
  renderSudoku();
}

function renderSudoku() {
  const board = document.querySelector("#sudoku .sudoku-board");
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      if (sudokuState.puzzle[i][j] !== 0) {
        cell.textContent = sudokuState.puzzle[i][j];
        cell.style.fontWeight = "bold";
        cell.style.backgroundColor = "#f0f0f0";
      } else if (sudokuState.userInput[i][j] !== 0) {
        cell.textContent = sudokuState.userInput[i][j];
        cell.contentEditable = true;
      } else {
        cell.contentEditable = true;
      }
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("input", handleSudokuInput);
      board.appendChild(cell);
    }
  }
}

function handleSudokuInput(e) {
  const val = parseInt(e.target.textContent) || 0;
  if (val < 0 || val > 9) e.target.textContent = "";
  const row = e.target.dataset.row;
  const col = e.target.dataset.col;
  sudokuState.userInput[row][col] = val;
}

function resetSudoku() {
  initSudoku();
}

function generateSudoku() {
  const puzzle = Array(9)
    .fill()
    .map(() => Array(9).fill(0));
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 9; j += 3) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          puzzle[i + k][j + l] = ((i + j + k + l) % 9) + 1;
        }
      }
    }
  }
  return puzzle;
}

function solveSudokuPuzzle(grid) {
  function isValid(num, row, col) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  }

  function solve() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(num, i, j)) {
              grid[i][j] = num;
              if (solve()) return true;
              grid[i][j] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  solve();
}

// ============ WORD SEARCH ============
let wordSearchState = {
  grid: [],
  words: [
    "JAVASCRIPT",
    "PYTHON",
    "HTML",
    "CSS",
    "REACT",
    "NODE",
    "DATABASE",
    "ALGORITHM",
  ],
  placed: [],
};

function initWordSearch() {
  wordSearchState.grid = Array(10)
    .fill()
    .map(() => Array(10).fill(""));
  wordSearchState.placed = [];
  wordSearchState.words.forEach((word) => placeWord(word));
  fillEmptyWords();
  renderWordSearch();
}

function placeWord(word) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  let attempts = 0;
  while (attempts < 100) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * 10);
    const col = Math.floor(Math.random() * 10);
    if (canPlaceWord(word, row, col, dir)) {
      for (let i = 0; i < word.length; i++) {
        wordSearchState.grid[row + i * dir[0]][col + i * dir[1]] = word[i];
      }
      wordSearchState.placed.push(word);
      return;
    }
    attempts++;
  }
}

function canPlaceWord(word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dir[0];
    const c = col + i * dir[1];
    if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;
    if (wordSearchState.grid[r][c] && wordSearchState.grid[r][c] !== word[i])
      return false;
  }
  return true;
}

function fillEmptyWords() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (!wordSearchState.grid[i][j]) {
        wordSearchState.grid[i][j] =
          letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function renderWordSearch() {
  const grid = document.querySelector("#word-search .word-grid");
  grid.innerHTML = "";
  wordSearchState.grid.forEach((row) => {
    row.forEach((letter) => {
      const cell = document.createElement("div");
      cell.className = "word-cell";
      cell.textContent = letter;
      grid.appendChild(cell);
    });
  });

  const list = document.getElementById("word-list");
  list.innerHTML =
    "<h4>Find these words:</h4><ul>" +
    wordSearchState.words.map((w) => `<li>${w}</li>`).join("") +
    "</ul>";
}

function recordGameResult(game, result) {
  const results = JSON.parse(localStorage.getItem("game_results") || "{}");
  if (!results[game]) results[game] = [];
  results[game].push({
    result,
    date: new Date().toISOString(),
  });
  localStorage.setItem("game_results", JSON.stringify(results));
}
