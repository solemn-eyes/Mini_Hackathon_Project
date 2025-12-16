document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarToggleMobile = document.getElementById("sidebar-toggle-mobile");
  const mainContent = document.getElementById("main-content");

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");
  }

  sidebarToggle.addEventListener("click", toggleSidebar);
  sidebarToggleMobile.addEventListener("click", toggleSidebar);

  // Apply mood theme
  const savedMood = localStorage.getItem("mood") || "neutral";
  document.body.className = savedMood;

  // Game suggestions
  updateGameSuggestions();

  // Games
  initTicTacToe();
  initMemoryGame();
  initSudoku();
  initWordPuzzle();
});

function updateGameSuggestions() {
  const mood = localStorage.getItem("mood") || "neutral";
  const suggestions = document.getElementById("game-suggestions");
  if (mood === "happy") {
    suggestions.innerHTML =
      "<p>Great mood! Try playing Tic Tac Toe or the Memory Game to keep the fun going!</p>";
  } else {
    suggestions.innerHTML =
      "<p>Feeling down? Chat with the bot or set some goals to lift your spirits.</p>";
  }
}

function initTicTacToe() {
  const cells = document.querySelectorAll(".cell");
  const resetBtn = document.getElementById("reset-tic-tac-toe");
  let board = Array(9).fill(null);
  let currentPlayer = "X";

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      const index = cell.dataset.index;
      if (!board[index]) {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        if (checkWinner()) {
          alert(`${currentPlayer} wins!`);
          resetBoard();
        } else if (board.every((cell) => cell)) {
          alert("Draw!");
          resetBoard();
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
        }
      }
    });
  });

  resetBtn.addEventListener("click", resetBoard);

  function resetBoard() {
    board = Array(9).fill(null);
    cells.forEach((cell) => (cell.textContent = ""));
    currentPlayer = "X";
  }

  function checkWinner() {
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
    return wins.some((combo) => combo.every((i) => board[i] === currentPlayer));
  }
}

function initMemoryGame() {
  const board = document.querySelector(".memory-board");
  const resetBtn = document.getElementById("reset-memory");
  const cards = [
    "🐶",
    "🐶",
    "🐱",
    "🐱",
    "🐭",
    "🐭",
    "🐹",
    "🐹",
    "🐰",
    "🐰",
    "🦊",
    "🦊",
    "🐻",
    "🐻",
    "🐼",
    "🐼",
  ];
  let shuffled = shuffle(cards);
  let flipped = [];
  let matched = [];

  function createBoard() {
    board.innerHTML = "";
    shuffled.forEach((card, index) => {
      const div = document.createElement("div");
      div.className = "memory-card";
      div.dataset.value = card;
      div.dataset.index = index;
      div.addEventListener("click", flipCard);
      board.appendChild(div);
    });
  }

  function flipCard() {
    if (
      flipped.length < 2 &&
      !this.classList.contains("flipped") &&
      !matched.includes(this.dataset.index)
    ) {
      this.classList.add("flipped");
      this.textContent = this.dataset.value;
      flipped.push(this);
      if (flipped.length === 2) {
        setTimeout(checkMatch, 500);
      }
    }
  }

  function checkMatch() {
    if (flipped[0].dataset.value === flipped[1].dataset.value) {
      matched.push(flipped[0].dataset.index, flipped[1].dataset.index);
      flipped = [];
      if (matched.length === cards.length) {
        alert("You won!");
      }
    } else {
      flipped.forEach((card) => {
        card.classList.remove("flipped");
        card.textContent = "";
      });
      flipped = [];
    }
  }

  resetBtn.addEventListener("click", () => {
    shuffled = shuffle(cards);
    matched = [];
    createBoard();
  });

  createBoard();
}

function initSudoku() {
  const board = document.querySelector(".sudoku-board");
  const newBtn = document.getElementById("new-sudoku");
  const solveBtn = document.getElementById("solve-sudoku");
  let puzzle = generateSudoku();

  function createBoard() {
    board.innerHTML = "";
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      cell.contentEditable = true;
      cell.textContent = puzzle[i] || "";
      cell.addEventListener("input", (e) => {
        const value = e.target.textContent;
        if (value && !/^[1-9]$/.test(value)) {
          e.target.textContent = "";
        }
      });
      board.appendChild(cell);
    }
  }

  newBtn.addEventListener("click", () => {
    puzzle = generateSudoku();
    createBoard();
  });

  solveBtn.addEventListener("click", () => {
    const cells = document.querySelectorAll(".sudoku-cell");
    const grid = Array.from(cells).map(
      (cell) => parseInt(cell.textContent) || 0
    );
    if (solveSudoku(grid)) {
      cells.forEach((cell, index) => {
        cell.textContent = grid[index];
      });
    } else {
      alert("No solution found!");
    }
  });

  createBoard();
}

function initWordPuzzle() {
  const grid = document.querySelector(".word-grid");
  const wordList = document.getElementById("word-list");
  const newBtn = document.getElementById("new-word-puzzle");
  const words = [
    "JAVASCRIPT",
    "PYTHON",
    "HTML",
    "CSS",
    "REACT",
    "NODE",
    "DATABASE",
    "ALGORITHM",
  ];
  let placedWords = [];

  function createPuzzle() {
    const puzzle = Array(100).fill("");
    placedWords = [];
    words.forEach((word) => {
      placeWord(puzzle, word);
    });
    fillEmptyCells(puzzle);
    displayPuzzle(puzzle);
    displayWordList();
  }

  function placeWord(puzzle, word) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]; // right, down, diagonal
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * 10);
      const startCol = Math.floor(Math.random() * 10);
      if (canPlaceWord(puzzle, word, startRow, startCol, dir)) {
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dir[0];
          const col = startCol + i * dir[1];
          puzzle[row * 10 + col] = word[i];
        }
        placedWords.push(word);
        placed = true;
      }
      attempts++;
    }
  }

  function canPlaceWord(puzzle, word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dir[0];
      const c = col + i * dir[1];
      if (
        r < 0 ||
        r >= 10 ||
        c < 0 ||
        c >= 10 ||
        (puzzle[r * 10 + c] && puzzle[r * 10 + c] !== word[i])
      ) {
        return false;
      }
    }
    return true;
  }

  function fillEmptyCells(puzzle) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 100; i++) {
      if (!puzzle[i]) {
        puzzle[i] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  function displayPuzzle(puzzle) {
    grid.innerHTML = "";
    puzzle.forEach((letter) => {
      const cell = document.createElement("div");
      cell.className = "word-cell";
      cell.textContent = letter;
      grid.appendChild(cell);
    });
  }

  function displayWordList() {
    wordList.innerHTML =
      "<h4>Find these words:</h4><ul>" +
      placedWords.map((word) => `<li>${word}</li>`).join("") +
      "</ul>";
  }

  newBtn.addEventListener("click", createPuzzle);
  createPuzzle();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[j]];
  }
  return array;
}

function generateSudoku() {
  // Simple Sudoku generator - creates a partially filled grid
  const grid = Array(81).fill(0);
  // Fill some random cells
  for (let i = 0; i < 30; i++) {
    const index = Math.floor(Math.random() * 81);
    const value = Math.floor(Math.random() * 9) + 1;
    if (isValidSudoku(grid, index, value)) {
      grid[index] = value;
    }
  }
  return grid;
}

function isValidSudoku(grid, index, value) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i] === value || grid[i * 9 + col] === value) {
      return false;
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[(boxRow + i) * 9 + (boxCol + j)] === value) {
        return false;
      }
    }
  }
  return true;
}

function solveSudoku(grid) {
  function isValid(num, pos) {
    const [row, col] = [Math.floor(pos / 9), pos % 9];
    for (let i = 0; i < 9; i++) {
      if (grid[row * 9 + i] === num && i !== col) return false;
      if (grid[i * 9 + col] === num && i !== row) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (
          grid[(boxRow + i) * 9 + (boxCol + j)] === num &&
          (boxRow + i !== row || boxCol + j !== col)
        )
          return false;
      }
    }
    return true;
  }

  function solve() {
    for (let i = 0; i < 81; i++) {
      if (grid[i] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(num, i)) {
            grid[i] = num;
            if (solve()) return true;
            grid[i] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  return solve();
}
