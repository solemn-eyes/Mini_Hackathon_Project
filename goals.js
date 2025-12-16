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

  // Goals
  const goalInput = document.getElementById("goal-input");
  const addGoalBtn = document.getElementById("add-goal");
  const goalsList = document.getElementById("goals-list");
  addGoalBtn.addEventListener("click", addGoal);
  loadGoals();

  // Apply mood theme
  const savedMood = localStorage.getItem("mood") || "neutral";
  document.body.className = savedMood;
});

function addGoal() {
  const goalInput = document.getElementById("goal-input");
  const goal = goalInput.value.trim();
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
  }
}

function loadGoals() {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";
  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span style="${
              goal.completed
                ? "text-decoration: line-through; color: #999;"
                : ""
            }">${goal.text}</span>
            <button onclick="deleteGoal(${index})" style="background: #ff4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer;">Delete</button>
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
}

function deleteGoal(index) {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.splice(index, 1);
  localStorage.setItem("goals", JSON.stringify(goals));
  loadGoals();
}
