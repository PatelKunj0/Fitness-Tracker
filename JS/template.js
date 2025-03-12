// Get template name from URL params
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get("template");
    const username = localStorage.getItem("currentUser");

    if (templateName) {
        document.getElementById("template-title").textContent = templateName;

        // Load existing exercises from user data
        if (username) {
            let userData = JSON.parse(localStorage.getItem(username));
            let template = userData.templates.find(t => t.name === templateName);

            if (template) {
                template.exercises.forEach(exercise => {
                    displayExercise(exercise);
                });
            }
        }
    }
});

function addExercise() {
    let exerciseName = prompt("Enter exercise name:");
    if (exerciseName && exerciseName.trim() !== "") {
        let username = localStorage.getItem("currentUser");
        if (!username) {
            alert("You must be logged in to add an exercise.");
            return;
        }

        let userData = JSON.parse(localStorage.getItem(username));
        let templateName = document.getElementById("template-title").textContent;

        let template = userData.templates.find(t => t.name === templateName);
        if (template) {
            template.exercises.push(exerciseName);
        }

        // Save back to localStorage
        localStorage.setItem(username, JSON.stringify(userData));

        displayExercise(exerciseName);
    }
}

function displayExercise(exerciseName) {
    let exerciseContainer = document.getElementById("exercise-container");

    let newExercise = document.createElement("div");
    newExercise.classList.add("exercise-box");
    newExercise.textContent = exerciseName;

    exerciseContainer.appendChild(newExercise);
}
