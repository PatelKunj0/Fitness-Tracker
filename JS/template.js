import exercises from './exercises.js';

document.addEventListener("DOMContentLoaded", () => {
    // Check if there's a template passed via URL (for editing an existing template)
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get("template");
    const username = localStorage.getItem("currentUser");

    if (templateName && username) {
        // Populate the template name input
        document.getElementById("template-name").value = templateName;

        // Retrieve user data and load existing exercises for this template (if any)
        let userData = JSON.parse(localStorage.getItem(username));
        let template = userData.templates.find(t => t.name === templateName);

        if (template && template.exercises && template.exercises.length > 0) {
            renderExercises();
        }
        
    }
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
    // Retrieve the current template name from the input field.
    const templateName = document.getElementById("template-name").value.trim();
    if (!templateName) {
      alert("Template name is missing.");
      return;
    }
    
    // Retrieve username and user data from localStorage
    const username = localStorage.getItem("currentUser");
    let userData = JSON.parse(localStorage.getItem(username)) || { templates: [] };
    
    // Try to find an existing template with this name
    let template = userData.templates.find(t => t.name === templateName);
    
    // If not found, create a new template object and add it to userData
    if (!template) {
      template = { name: templateName, exercises: [] };
      userData.templates.push(template);
    }
    
    // Push the new exercise object (with an empty sets array)
    template.exercises.push({
      name: exerciseName,
      sets: []
    });
    
    // Save updated user data to localStorage
    localStorage.setItem(username, JSON.stringify(userData));
    
    // Optionally, update the UI to reflect the new exercise.
    // Make sure renderExercises() is defined to update the display.
    renderExercises();
  }
  function renderExercises() {
    const container = document.getElementById("exercise-container");
    container.innerHTML = ""; // Clear previous content
    
    // Retrieve the current template name and user data
    const templateName = document.getElementById("template-name").value.trim();
    const username = localStorage.getItem("currentUser");
    let userData = JSON.parse(localStorage.getItem(username)) || { templates: [] };
    let template = userData.templates.find(t => t.name === templateName);
    
    if (template && template.exercises) {
      template.exercises.forEach(exercise => {
        // Create a div for each exercise
        let exerciseDiv = document.createElement("div");
        exerciseDiv.classList.add("exercise-box");
        
        // Check if exercise is an object and use its name, otherwise use it directly
        exerciseDiv.textContent = typeof exercise === "object" ? exercise.name : exercise;
        
        container.appendChild(exerciseDiv);
      });
    }
  }
  


function saveTemplate() {
    const templateNameInput = document.getElementById("template-name").value.trim();
    if (!templateNameInput) {
        alert("Please enter a template name.");
        return;
    }

    // Gather all the exercises added to the template
    const exercisesElements = document.querySelectorAll('.exercise-box');
    const selectedExercises = Array.from(exercisesElements).map(box => box.textContent);

    const username = localStorage.getItem("currentUser");
    if (!username) {
        alert("You must be logged in to save a template.");
        return;
    }

    // Retrieve user data from localStorage
    let userData = JSON.parse(localStorage.getItem(username)) || { templates: [] };

    // Check if the template already exists (for editing)
    let existingTemplate = userData.templates.find(t => t.name === templateNameInput);
    if (existingTemplate) {
        existingTemplate.exercises = selectedExercises;
    } else {
        // Create a new template entry
        userData.templates.push({ name: templateNameInput, exercises: selectedExercises });
    }

    // Save the updated user data back to localStorage
    localStorage.setItem(username, JSON.stringify(userData));

    // Redirect to the homepage
    window.location.href = 'index.html';
}

// Attach functions to global scope so inline event handlers can access them
window.goBack = goBack;
window.addExercise = addExercise;
window.closePopup = closePopup;
window.filterExercises = filterExercises;
window.saveTemplate = saveTemplate;
window.populateExerciseList = populateExerciseList;
