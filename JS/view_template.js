let workoutStartTime;
let timerInterval;
let currentTemplate;
let userData;
let username;
let workoutActive = false; // Track workout state

document.addEventListener("DOMContentLoaded", initView);

function initView() {
  const params = new URLSearchParams(window.location.search);
  const templateName = params.get("template");

  // Check if user is logged in
  username = localStorage.getItem("currentUser");
  if (!username) {
    window.location.href = "login.html";
    return;
  }

  // Load user data
  userData = JSON.parse(localStorage.getItem(username)) || { templates: [] };

  // Find the matching template
  currentTemplate = userData.templates.find(t => t.name === templateName);

  // If no template found, redirect home
  if (!currentTemplate) {
    alert("Template not found.");
    window.location.href = "index.html";
    return;
  }

  // Ensure exercises are proper objects
  for (let i = 0; i < currentTemplate.exercises.length; i++) {
    if (typeof currentTemplate.exercises[i] === "string") {
      currentTemplate.exercises[i] = {
        name: currentTemplate.exercises[i],
        sets: []
      };
    }
  }

  // Save any conversions
  localStorage.setItem(username, JSON.stringify(userData));

  // Display template name
  document.getElementById("template-title").textContent = currentTemplate.name;

  // Display last performed date
  const lastPerformedSpan = document.getElementById("last-performed");
  if (currentTemplate.lastPerformed) {
    const daysAgo = calculateDaysAgo(new Date(currentTemplate.lastPerformed), new Date());
    lastPerformedSpan.textContent = `${daysAgo} days ago`;
  } else {
    lastPerformedSpan.textContent = "N/A";
  }

  // Render exercises and stats
  renderExercises();
}

/**
 * Render all exercises as tables with sets and a "Done?" column.
 */
function renderExercises() {
  const exercisesList = document.getElementById("exercises-list");
  exercisesList.innerHTML = "";

  if (!currentTemplate.exercises || currentTemplate.exercises.length === 0) {
    exercisesList.textContent = "No exercises yet.";
    renderStats();
    return;
  }

  currentTemplate.exercises.forEach((exerciseObj, exerciseIndex) => {
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise-item");

    // Header
    const header = document.createElement("div");
    header.classList.add("exercise-header");
    header.innerHTML = `<h3>${exerciseObj.name}</h3>`;
    exerciseDiv.appendChild(header);

    // Table
    const table = document.createElement("table");
    table.classList.add("sets-table");
    table.innerHTML = `
      <thead>
        <tr><th>Set</th><th>lbs</th><th>Reps</th><th>Done?</th></tr>
      </thead>
    `;

    const tbody = document.createElement("tbody");

    // Render sets
    if (!exerciseObj.sets || exerciseObj.sets.length === 0) {
      const noSetRow = document.createElement("tr");
      noSetRow.innerHTML = `<td colspan="4">No sets yet.</td>`;
      tbody.appendChild(noSetRow);
    } else {
      exerciseObj.sets.forEach((setObj, setIndex) => {
        if (typeof setObj.completed === "undefined") setObj.completed = false;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${setIndex + 1}</td>
          <td>${setObj.weight}</td>
          <td>${setObj.reps}</td>
          <td></td>
        `;
        // Checkmark
        const checkCell = row.querySelector("td:last-child");
        const checkBtn = document.createElement("button");
        checkBtn.classList.add("checkmark-btn");
        checkBtn.textContent = "✓";
        if (setObj.completed) checkBtn.classList.add("completed");
        checkBtn.addEventListener("click", () => {
          if (!workoutActive) return alert("Please press 'Start Workout' first.");
          setObj.completed = !setObj.completed;
          checkBtn.classList.toggle("completed", setObj.completed);
          saveTemplate();
          renderStats();
        });
        checkCell.appendChild(checkBtn);
        tbody.appendChild(row);
      });
    }

    table.appendChild(tbody);
    exerciseDiv.appendChild(table);
    exercisesList.appendChild(exerciseDiv);
  });

  // After rendering exercises, show stats
  renderStats();
}

/**
 * Save user data (including sets & completed flags) back to localStorage.
 */
function saveTemplate() {
  localStorage.setItem(username, JSON.stringify(userData));
}

/**
 * Go back to homepage.
 */
function goBack() {
  window.location.href = "index.html";
}

/**
 * Go to edit view.
 */
function editTemplate() {
  const params = new URLSearchParams(window.location.search);
  const templateName = params.get("template");
  window.location.href = `template.html?template=${encodeURIComponent(templateName)}`;
}

/**
 * Start the workout timer and mark template as performed.
 */
function startTimer() {
  workoutStartTime = Date.now();
  const timerEl = document.getElementById("timer");
  timerEl.style.display = "block";
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - workoutStartTime;
    const mins = Math.floor(elapsed / 60000);
    const secs = Math.floor((elapsed % 60000) / 1000);
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2,'0')}`;
  }, 1000);
}

function startWorkout() {
  currentTemplate.lastPerformed = new Date().toISOString();
  saveTemplate();
  workoutActive = true;
  const editBtn = document.querySelector(".edit-btn");
  if (editBtn) editBtn.style.visibility = "hidden";
  startTimer();
  alert("Workout started! You can now mark your sets.");
  // Hide that button and show cancel
  const startBtn = document.querySelector('.start-workout-btn');
  if (startBtn) startBtn.style.display = "none";
  const cancelBtn = document.createElement('button');
  cancelBtn.classList.add('cancel-workout-btn');
  cancelBtn.textContent = "Cancel Workout";
  cancelBtn.style.cssText = 'background:#f44336;color:#fff;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;font-weight:bold;margin-top:20px;';
  cancelBtn.onclick = cancelWorkout;
  document.querySelector('.container').append(cancelBtn);
}

function cancelWorkout() {
  if (!confirm("Are you sure you want to cancel the workout?")) return;
  workoutActive = false;
  clearInterval(timerInterval);
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.style.display = "none";
  window.location.href = "index.html";
}

function stopTimer() {
  clearInterval(timerInterval);
}

/**
 * Utility: days difference
 */
function calculateDaysAgo(oldDate, newDate) {
  const oneDayMs = 24*60*60*1000;
  return Math.floor((newDate - oldDate)/oneDayMs);
}

/**
 * Compute workout stats
 */
function calculateStats() {
  if (!currentTemplate || !currentTemplate.exercises) return null;
  let totalSets=0, totalReps=0, totalWeight=0, completed=0;
  currentTemplate.exercises.forEach(ex => {
    ex.sets?.forEach(s => {
      totalSets++;
      totalReps += Number(s.reps)||0;
      totalWeight += Number(s.weight)||0;
      if (s.completed) completed++;
    });
  });
  return totalSets>0 ? {
    totalSets,
    totalReps,
    averageWeight:(totalWeight/totalSets).toFixed(2),
    completionRate:((completed/totalSets)*100).toFixed(1)
  } : null;
}

/**
 * Render stats box
 */
function renderStats() {
  const stats = calculateStats();
  const statsDiv = document.getElementById("exercise-stats");
  if (!statsDiv) return;
  if (!stats) {
    statsDiv.innerHTML = "<p>No exercise data available yet.</p>";
  } else {
    statsDiv.innerHTML = `
      <h2>Exercise Stats</h2>
      <p>Total Sets: ${stats.totalSets}</p>
      <p>Total Reps: ${stats.totalReps}</p>
      <p>Average Weight: ${stats.averageWeight} lbs</p>
      <p>Completion Rate: ${stats.completionRate}%</p>
    `;
  }
}

// Expose for inline handlers
window.goBack = goBack;
window.editTemplate = editTemplate;
window.startWorkout = startWorkout;
