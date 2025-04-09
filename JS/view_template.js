let workoutStartTime;
let timerInterval;
let currentTemplate;
let userData;
let username;
let workoutActive = false; // New flag to track workout state

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

  // If no template found, go home
  if (!currentTemplate) {
    alert("Template not found.");
    window.location.href = "index.html";
    return;
  }

  // Convert any string-based exercises to objects
  for (let i = 0; i < currentTemplate.exercises.length; i++) {
    if (typeof currentTemplate.exercises[i] === "string") {
      currentTemplate.exercises[i] = {
        name: currentTemplate.exercises[i],
        sets: []
      };
    }
  }

  // Save back in case we converted anything
  localStorage.setItem(username, JSON.stringify(userData));

  // Display template name
  document.getElementById("template-title").textContent = currentTemplate.name;

  // Last Performed
  const lastPerformedSpan = document.getElementById("last-performed");
  if (currentTemplate.lastPerformed) {
    const daysAgo = calculateDaysAgo(new Date(currentTemplate.lastPerformed), new Date());
    lastPerformedSpan.textContent = `${daysAgo} days ago`;
  } else {
    lastPerformedSpan.textContent = "N/A";
  }

  // Render exercises and sets
  renderExercises();
}

/**
 * Render all exercises as tables with sets and a check mark for each set.
 */
function renderExercises() {
  const exercisesList = document.getElementById("exercises-list");
  exercisesList.innerHTML = "";

  if (!currentTemplate.exercises || currentTemplate.exercises.length === 0) {
    exercisesList.textContent = "No exercises yet.";
    return;
  }

  currentTemplate.exercises.forEach((exerciseObj, exerciseIndex) => {
    // Container for each exercise
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise-item");

    // Header with exercise name
    const exerciseHeader = document.createElement("div");
    exerciseHeader.classList.add("exercise-header");
    exerciseHeader.innerHTML = `<h3>${exerciseObj.name}</h3>`;
    exerciseDiv.appendChild(exerciseHeader);

    // Table for sets
    const table = document.createElement("table");
    table.classList.add("sets-table");

    // Table header row with additional "Done?" column
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Set</th>
        <th>lbs</th>
        <th>Reps</th>
        <th>Done?</th>
      </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");

    // Render existing sets if available
    if (!exerciseObj.sets || exerciseObj.sets.length === 0) {
      const noSetRow = document.createElement("tr");
      noSetRow.innerHTML = `<td colspan="4">No sets yet.</td>`;
      tbody.appendChild(noSetRow);
    } else {
      exerciseObj.sets.forEach((setObj, setIndex) => {
        // Ensure completed property exists
        if (typeof setObj.completed === "undefined") {
          setObj.completed = false;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${setIndex + 1}</td>
          <td>${setObj.weight}</td>
          <td>${setObj.reps}</td>
          <td></td>
        `;
        // Create the check mark button inside the last cell
        const checkCell = row.querySelector("td:last-child");
        const checkBtn = document.createElement("button");
        checkBtn.classList.add("checkmark-btn");
        checkBtn.textContent = "✓";

        // Apply completed styling if already marked
        if (setObj.completed) {
          checkBtn.classList.add("completed");
        }

        // Only allow toggling if the workout is active
        checkBtn.addEventListener("click", () => {
          if (!workoutActive) {
            alert("Please press 'Start Workout' first.");
            return;
          }
          // Toggle completion status
          setObj.completed = !setObj.completed;
          if (setObj.completed) {
            checkBtn.classList.add("completed");
          } else {
            checkBtn.classList.remove("completed");
          }
          saveTemplate();
        });
        checkCell.appendChild(checkBtn);

        tbody.appendChild(row);
      });
    }

    // --- Inline "Add Set" Row at the Bottom ---
    const addSetRow = document.createElement("tr");
    addSetRow.innerHTML = `
      <td></td>
      <td><input type="number" class="weight-input" placeholder="lbs" style="width: 60px;" /></td>
      <td style="display: flex; align-items: center; gap: 5px;">
        <input type="number" class="reps-input" placeholder="reps" style="width: 60px;" />
        <button class="add-set-inline-btn">Add</button>
      </td>
      <td></td>
    `;
    // Add click listener to the "Add" button
    const addBtn = addSetRow.querySelector(".add-set-inline-btn");
    addBtn.addEventListener("click", () => {
      const weightInput = addSetRow.querySelector(".weight-input");
      const repsInput = addSetRow.querySelector(".reps-input");

      const weightVal = weightInput.value.trim();
      const repsVal = repsInput.value.trim();

      if (!weightVal || !repsVal) {
        alert("Please enter both weight and reps.");
        return;
      }

      if (!exerciseObj.sets) {
        exerciseObj.sets = [];
      }
      // Add new set with a default completed state of false.
      exerciseObj.sets.push({ weight: weightVal, reps: repsVal, completed: false });

      // Clear input fields
      weightInput.value = "";
      repsInput.value = "";

      // Save updated data and re-render the exercises
      saveTemplate();
      renderExercises();
    });
    tbody.appendChild(addSetRow);

    table.appendChild(tbody);
    exerciseDiv.appendChild(table);

    // Finally, add the entire exercise container to the main list
    exercisesList.appendChild(exerciseDiv);
  });
}

/**
 * Save user data to localStorage (including any new sets).
 */
function saveTemplate() {
  localStorage.setItem(username, JSON.stringify(userData));
}

/**
 * "X" button -> go back to homepage
 */
function goBack() {
  window.location.href = "index.html";
}

/**
 * "Edit" button -> go to template.html
 */
function editTemplate() {
  const params = new URLSearchParams(window.location.search);
  const templateName = params.get("template");
  window.location.href = `template.html?template=${encodeURIComponent(templateName)}`;
}

/**
 * "Start Workout" -> mark lastPerformed as now and enable check marks to be clickable.
 */
function startTimer() {
  workoutStartTime = Date.now();
  const timerElement = document.getElementById("timer");
  timerElement.style.display = "block"; // Show the timer
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - workoutStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    timerElement.textContent = formattedTime;
  }, 1000);
}

function startWorkout() {
  currentTemplate.lastPerformed = new Date().toISOString();
  saveTemplate();
  workoutActive = true; // Enable any other workout logic
  const editBtn = document.querySelector(".edit-btn");
  if (editBtn) {
    editBtn.style.visibility = "hidden";
  }
  startTimer(); // Starts and shows the timer
  alert("Workout started! You can now mark your sets.");

  // Hide the Start Workout button
  const startBtn = document.querySelector('.start-workout-btn');
  if (startBtn) {
    startBtn.style.display = "none";
  }
  // Create a Cancel Workout button
  const cancelBtn = document.createElement('button');
  cancelBtn.classList.add('cancel-workout-btn');
  cancelBtn.textContent = "Cancel Workout";
  // Style the cancel button (you can adjust these inline styles or move them to CSS)
  cancelBtn.style.backgroundColor = "#f44336"; // red color
  cancelBtn.style.color = "white";
  cancelBtn.style.border = "none";
  cancelBtn.style.padding = "10px 20px";
  cancelBtn.style.borderRadius = "20px";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.style.fontWeight = "bold";
  cancelBtn.style.marginTop = "20px";
  // Assign its onclick handler
  cancelBtn.onclick = cancelWorkout;
  
  // Append the cancel button to the container (or wherever appropriate)
  const container = document.querySelector('.container');
  container.appendChild(cancelBtn);

  renderExercises();
}

function cancelWorkout() {
  // Show a confirmation pop-up
  if (confirm("Are you sure you want to cancel the workout?")) {
    // If confirmed, disable workout logic and stop the timer
    workoutActive = false;
    clearInterval(timerInterval);
  
    // Optionally hide the timer element
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.style.display = "none";
    }
  
    // Redirect to the homepage
    window.location.href = "index.html";
  }
  // If the user clicks Cancel in the pop-up, do nothing.
}




function stopTimer() {
  clearInterval(timerInterval);
}


/**
 * Utility: Calculate days difference
 */
function calculateDaysAgo(oldDate, newDate) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((newDate - oldDate) / oneDayMs);
}

// Expose functions if you're using inline onclick in HTML
window.goBack = goBack;
window.editTemplate = editTemplate;
window.startWorkout = startWorkout;
