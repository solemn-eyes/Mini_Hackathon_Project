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

  // Tracker
  const ctx = document.getElementById("progress-chart").getContext("2d");
  window.progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Goals Completed",
          data: [],
          borderColor: "rgba(74, 144, 226, 1)",
          backgroundColor: "rgba(74, 144, 226, 0.2)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });

  // Create game stats chart
  const section = document.createElement("section");
  section.innerHTML =
    '<h2>Game Statistics</h2><canvas id="game-stats-chart"></canvas>';
  document.querySelector("main").appendChild(section);

  const ctx2 = document.getElementById("game-stats-chart");
  window.gameStatsChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Games Played",
          data: [],
          backgroundColor: "rgba(102, 126, 234, 0.6)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Apply mood theme
  const savedMood = localStorage.getItem("mood") || "neutral";
  document.body.className = savedMood;

  updateCharts();
  setInterval(updateCharts, 5000);
});

function updateCharts() {
  updateGoalsChart();
  updateGameStatsChart();
}

function updateGoalsChart() {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  const dates = {};
  goals.forEach((goal) => {
    const date = new Date(goal.date).toLocaleDateString();
    if (!dates[date]) dates[date] = 0;
    if (goal.completed) dates[date]++;
  });
  const labels = Object.keys(dates);
  const data = Object.values(dates);
  window.progressChart.data.labels = labels;
  window.progressChart.data.datasets[0].data = data;
  window.progressChart.update();
}

function updateGameStatsChart() {
  const results = JSON.parse(localStorage.getItem("game_results") || "{}");
  const gameNames = Object.keys(results);
  const gameCounts = gameNames.map((game) => results[game].length);

  window.gameStatsChart.data.labels = gameNames;
  window.gameStatsChart.data.datasets[0].data = gameCounts;
  window.gameStatsChart.update();
}
