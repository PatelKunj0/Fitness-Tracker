import exercises from './exercises.js';

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get("template");
    const username = localStorage.getItem("currentUser");
  
    // if editing, prefill the name
    if (templateName && username) {
      document.getElementById("template-name").value = templateName;
    }
  
    // always render whatever exercises exist (including your new setsCount/repsPerSet fields)
    renderExercises();
  });
  

function goBack() {
    window.location.href = 'index.html';
}

function addExercise() {
    // Populate the exercise list and display the popup
    populateExerciseList();
    document.getElementById('exercise-popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('exercise-popup').style.display = 'none';
}

function populateExerciseList() {
    const exerciseList = document.getElementById('exercise-list');
    exerciseList.innerHTML = "";

    exercises.forEach(exercise => {
        const item = document.createElement('div');
        item.classList.add('exercise-item');
        item.textContent = `${exercise.name} (${exercise.category})`;

        // When an exercise is clicked, add it to the template and close the popup
        item.addEventListener('click', () => {
            addExerciseToTemplate(exercise.name);
            closePopup();
        });

        exerciseList.appendChild(item);
    });
}

function filterExercises() {
    const query = document.getElementById('search-exercise').value.toLowerCase();
    const items = document.querySelectorAll('.exercise-item');

    items.forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(query)
            ? 'block'
            : 'none';
    });
}

function addExerciseToTemplate(exerciseName) {
    const username = localStorage.getItem("currentUser");
    if (!username) { alert("Log in first."); return; }
    let userData = JSON.parse(localStorage.getItem(username)) || { templates: [] };
    let templateName = document.getElementById("template-name").value.trim();
    if (!templateName) { alert("Name your template first."); return; }
    let template = userData.templates.find(t => t.name === templateName);
    if (!template) {
      template = { name: templateName, exercises: [] };
      userData.templates.push(template);
    }
    // seed with one empty set (lbs/reps blank)
    template.exercises.push({
        name:  exerciseName,
        sets: [ { weight: "", reps: "" } ]
        });

    localStorage.setItem(username, JSON.stringify(userData));
    closePopup();
    renderExercises();
}

function renderExercises() {
    const container   = document.getElementById("exercise-container");
    container.innerHTML = "";
  
    const username     = localStorage.getItem("currentUser");
    const templateName = document.getElementById("template-name").value.trim();
    if (!username || !templateName) return;
  
    const userData = JSON.parse(localStorage.getItem(username)) || { templates: [] };
    const template = userData.templates.find(t => t.name === templateName);
    if (!template || !template.exercises) return;
  
    template.exercises.forEach(exerciseObj => {
      const box = document.createElement("div");
      box.classList.add("exercise-box");
  
      // title
      const h3 = document.createElement("h3");
      h3.textContent = exerciseObj.name;
      box.appendChild(h3);
  
      // build table
      const table = document.createElement("table");
      table.classList.add("sets-table");
      table.innerHTML = `
        <thead>
          <tr>
            <th>Set</th><th>+lbs</th><th>Reps</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
  
      // one row per set in the data model
      exerciseObj.sets.forEach((setObj, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${i+1}</td>
          <td><input type="number" class="lbs-input"  value="${setObj.weight}" placeholder="lbs"/></td>
          <td><input type="number" class="reps-input" value="${setObj.reps}"  placeholder="reps"/></td>
        `;
        // update model on change
        row.querySelector(".lbs-input")
           .addEventListener("change", e => {
             setObj.weight = e.target.value;
             localStorage.setItem(username, JSON.stringify(userData));
           });
        row.querySelector(".reps-input")
           .addEventListener("change", e => {
             setObj.reps = e.target.value;
             localStorage.setItem(username, JSON.stringify(userData));
           });
        tbody.appendChild(row);
      });
  
      // + Add Set button
      const addBtn = document.createElement("button");
      addBtn.classList.add("add-set-btn");
      addBtn.textContent = "+ Add Set";
      addBtn.addEventListener("click", () => {
        exerciseObj.sets.push({ weight: "", reps: "" });
        localStorage.setItem(username, JSON.stringify(userData));
        renderExercises();
      });
  
      box.appendChild(table);
      box.appendChild(addBtn);
      container.appendChild(box);
    });
  }
  
  
  

function saveTemplate() {
    const templateName = document
        .getElementById("template-name")
        .value.trim();
    if (!templateName) {
        alert("Please enter a template name.");
        return;
    }

    const username = localStorage.getItem("currentUser");
    if (!username) {
        alert("You must be logged in to save a template.");
        return;
    }

    // Build an array of { name, sets: [ {weight, reps}, ... ] }
    const exercisesData = Array.from(
        document.querySelectorAll(".exercise-box")
    ).map(box => {
      // exercise name from the <h3>
        const name = box.querySelector("h3").textContent.trim();

      // each row in the table → one set
        const sets = Array.from(
        box.querySelectorAll(".sets-table tbody tr")
    ).map(row => {
        const weight = row.querySelector(".lbs-input").value.trim();
        const reps   = row.querySelector(".reps-input").value.trim();
        return { weight, reps };
        });
  
        return { name, sets };
    });
  
    // load or init user data
    const userData = JSON.parse(localStorage.getItem(username)) || {
        templates: [],
    };
  
    // find existing or push new
    let tpl = userData.templates.find(t => t.name === templateName);
    if (tpl) {
        tpl.exercises = exercisesData;
    } else {
        userData.templates.push({
        name: templateName,
        exercises: exercisesData,
        });
    }
  
    // persist & go home
    localStorage.setItem(username, JSON.stringify(userData));
    window.location.href = "index.html";
  }
  
  

// Attach functions to global scope so inline event handlers can access them
window.goBack = goBack;
window.addExercise = addExercise;
window.closePopup = closePopup;
window.filterExercises = filterExercises;
window.saveTemplate = saveTemplate;
window.populateExerciseList = populateExerciseList;
