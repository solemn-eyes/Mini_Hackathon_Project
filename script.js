document.addEventListener("DOMContentLoaded", () => {
  // Mood selector
  const moodSelect = document.getElementById("mood");
  moodSelect.addEventListener("change", changeMood);

  // Goals
  const goalInput = document.getElementById("goal-input");
  const addGoalBtn = document.getElementById("add-goal");
  const goalsList = document.getElementById("goals-list");
  addGoalBtn.addEventListener("click", addGoal);
  loadGoals();

  // Tracker
  const ctx = document.getElementById("progress-chart").getContext("2d");
  const progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Goals Completed",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  updateChart();

  // Games
  initTicTacToe();
  initMemoryGame();

  // Chatbot
  const chatInput = document.getElementById("chat-input");
  const sendChatBtn = document.getElementById("send-chat");
  const chatMessages = document.getElementById("chat-messages");
  sendChatBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Load initial mood
  const savedMood = localStorage.getItem("mood") || "neutral";
  moodSelect.value = savedMood;
  changeMood();
});

function changeMood() {
  const mood = document.getElementById("mood").value;
  document.body.className = mood;
  localStorage.setItem("mood", mood);
  updateGameSuggestions();
  updateChatbot();
}

function updateGameSuggestions() {
  const mood = document.getElementById("mood").value;
  const suggestions = document.getElementById("game-suggestions");
  if (mood === "happy") {
    suggestions.innerHTML =
      "<p>Great mood! Try playing Tic Tac Toe or the Memory Game to keep the fun going!</p>";
  } else {
    suggestions.innerHTML =
      "<p>Feeling down? Chat with the bot or set some goals to lift your spirits.</p>";
  }
}

function addGoal() {
  const goal = document.getElementById("goal-input").value.trim();
  if (goal) {
    const goals = JSON.parse(localStorage.getItem("goals") || "[]");
    goals.push({
      text: goal,
      completed: false,
      date: new Date().toISOString(),
    });
    localStorage.setItem("goals", JSON.stringify(goals));
    goalInput.value = "";
    loadGoals();
    updateChart();
  }
}

function loadGoals() {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goalsList.innerHTML = "";
  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span>${goal.text}</span>
            <input type="checkbox" ${
              goal.completed ? "checked" : ""
            } onchange="toggleGoal(${index})">
        `;
    goalsList.appendChild(li);
  });
}

function toggleGoal(index) {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals[index].completed = !goals[index].completed;
  localStorage.setItem("goals", JSON.stringify(goals));
  loadGoals();
  updateChart();
}

function updateChart() {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  const dates = {};
  goals.forEach((goal) => {
    const date = new Date(goal.date).toDateString();
    if (!dates[date]) dates[date] = 0;
    if (goal.completed) dates[date]++;
  });
  const labels = Object.keys(dates);
  const data = Object.values(dates);
  progressChart.data.labels = labels;
  progressChart.data.datasets[0].data = data;
  progressChart.update();
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
    "A",
    "A",
    "B",
    "B",
    "C",
    "C",
    "D",
    "D",
    "E",
    "E",
    "F",
    "F",
    "G",
    "G",
    "H",
    "H",
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateChatbot() {
  const mood = document.getElementById("mood").value;
  chatMessages.innerHTML = `<p>Bot: Hello! I'm here to support you. How are you feeling today? (Mood: ${mood})</p>`;
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    chatMessages.innerHTML += `<p>You: ${message}</p>`;
    const response = getBotResponse(message);
    chatMessages.innerHTML += `<p>Bot: ${response}</p>`;
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function getBotResponse(message) {
  const mood = document.getElementById("mood").value;
  const responses = {
    happy: [
      "That's great! Keep that positive energy going!",
      "Wonderful! What made you happy today?",
      "Awesome! Let's celebrate with a game!",
    ],
    sad: [
      "I'm sorry you're feeling sad. I'm here for you.",
      "It's okay to feel sad sometimes. Want to talk about it?",
      "Let's try to find something that cheers you up.",
    ],
    angry: [
      "Anger is valid. Let's work through it together.",
      "What triggered your anger? I'm listening.",
      "Take a deep breath. I'm here to help.",
    ],
    anxious: [
      "Anxiety can be tough. You're not alone.",
      "Try some deep breathing. I'm here.",
      "What worries you? Let's address it.",
    ],
    neutral: [
      "How can I assist you today?",
      "Tell me more about your day.",
      "I'm here to chat or help with goals.",
    ],
  };
  return responses[mood][Math.floor(Math.random() * responses[mood].length)];
}
