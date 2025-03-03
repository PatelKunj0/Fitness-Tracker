// ../JS/script.js
function addTemplate() {
    let templateName = prompt("Enter template name:");
    if (templateName && templateName.trim() !== "") {
        let templateContainer = document.getElementById("templates-container");

        // Create a new template box
        let newTemplate = document.createElement("div");
        newTemplate.classList.add("template-box");
        newTemplate.textContent = templateName;

        // Add the new template to the container
        templateContainer.appendChild(newTemplate);
    }
}
