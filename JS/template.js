// Get template name from URL params
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get("template");

    if (templateName) {
        document.getElementById("template-title").textContent = templateName;
    }
});

function addExercise() {
    let exerciseName = prompt("Enter exercise name:");
    if (exerciseName && exerciseName.trim() !== "") {
        let exerciseContainer = document.getElementById("exercise-container");

        // Create a new exercise box
        let newExercise = document.createElement("div");
        newExercise.classList.add("exercise-box");
        newExercise.textContent = exerciseName;

        // Add to container
        exerciseContainer.appendChild(newExercise);
    }
}
