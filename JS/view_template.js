let currentTemplate;
let userData;
let username;

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
 * Render all exercises as tables with sets
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
    exerciseHeader.innerHTML = `
      <h3>${exerciseObj.name}</h3>
    `;
    exerciseDiv.appendChild(exerciseHeader);

    // Table for sets
    const table = document.createElement("table");
    table.classList.add("sets-table");

    // Table header row (NO "Previous" column)
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Set</th>
        <th>lbs</th>
        <th>Reps</th>
      </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");

    // If no sets yet
    if (!exerciseObj.sets || exerciseObj.sets.length === 0) {
      const noSetRow = document.createElement("tr");
      noSetRow.innerHTML = `
        <td colspan="3">No sets yet.</td>
      `;
      tbody.appendChild(noSetRow);
    } else {
      // Render each set
      exerciseObj.sets.forEach((setObj, setIndex) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${setIndex + 1}</td>
          <td>${setObj.weight}</td>
          <td>${setObj.reps}</td>
        `;
        tbody.appendChild(row);
      });
    }

    // --- Inline "Add Set" Row at the Bottom ---
    // This row has two input fields + a button
    const addSetRow = document.createElement("tr");
    addSetRow.innerHTML = `
      <td>+ Add Set</td>
      <td><input type="number" class="weight-input" placeholder="lbs" style="width: 60px;" /></td>
      <td style="display: flex; align-items: center; gap: 5px;">
        <input type="number" class="reps-input" placeholder="reps" style="width: 60px;" />
        <button class="add-set-inline-btn">Add</button>
      </td>
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

      // Add the new set to the exercise data
      if (!exerciseObj.sets) {
        exerciseObj.sets = [];
      }
      exerciseObj.sets.push({ weight: weightVal, reps: repsVal });

      // Clear the inputs
      weightInput.value = "";
      repsInput.value = "";

      // Save & re-render
      saveTemplate();
      renderExercises();
    });

    tbody.appendChild(addSetRow);

    table.appendChild(tbody);
    exerciseDiv.appendChild(table);

    // Finally, add the exercise to the main list
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
 * "Start Workout" -> mark lastPerformed as now
 */
function startWorkout() {
  currentTemplate.lastPerformed = new Date().toISOString();
  saveTemplate();
  alert("Workout started!");
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
