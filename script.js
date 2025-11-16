const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const alertSound = document.getElementById("alertSound");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

Notification.requestPermission();

addBtn.addEventListener("click", () => {
  const taskText = taskInput.value;
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;

  if (!taskText || !deadline) {
    alert("Enter task + deadline");
    return;
  }

  const newTask = {
    text: taskText,
    deadline,
    priority,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  deadlineInput.value = "";
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function sendNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("Task Reminder", { body: msg });
  }
}

function renderTasks() {
  taskList.innerHTML = "";
  let completedCount = 0;

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task";

    li.innerHTML = `
      <div class="left">
        <strong>${task.text}</strong>
        <span class="countdown"></span>
        <span class="priority ${task.priority}">${task.priority} Priority</span>
      </div>

      <div>
        <input type="checkbox" class="completeCheck" ${task.completed ? "checked" : ""}>
        <button class="deleteBtn">❌</button>
      </div>
    `;

    taskList.appendChild(li);

    const countdownSpan = li.querySelector(".countdown");
    const completeCheck = li.querySelector(".completeCheck");

    // Update progress
    if (task.completed) completedCount++;

    // Countdown + reverse timer
    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(task.deadline).getTime();
      let diff = end - now;

      if (diff <= 0) {
        diff = Math.abs(diff);
        li.classList.add("warning");
        countdownSpan.textContent = 
          "⏱️ Overdue: " +
          Math.floor(diff / 1000 / 60) + " mins ago";

        alertSound.play();
        sendNotification(`Deadline passed for: ${task.text}`);

        clearInterval(interval);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      countdownSpan.textContent = `⏳ ${hrs}h ${mins}m ${secs}s`;

      if (diff < 3600000) li.classList.add("warning");
    }, 1000);

    // Checkbox
    completeCheck.addEventListener("change", () => {
      task.completed = completeCheck.checked;
      saveTasks();
      renderTasks();
    });

    // Delete
    li.querySelector(".deleteBtn").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });
  });

  // Update progress bar
  const progressPercent = (completedCount / tasks.length) * 100 || 0;
  progressBar.value = progressPercent;
  progressText.textContent = `${Math.floor(progressPercent)}% Completed`;
}

renderTasks();
