function addTemplate() {
    let templateName = prompt("Enter template name:");
    if (templateName && templateName.trim() !== "") {
        let templateContainer = document.getElementById("templates-container");

        // Create a new template button
        let newTemplate = document.createElement("button");
        newTemplate.classList.add("template-box");
        newTemplate.textContent = templateName;

        // Navigate to template.html with the template name as a query param
        newTemplate.addEventListener("click", () => {
            window.location.href = `template.html?template=${encodeURIComponent(templateName)}`;
        });

        // Append the template button to container
        templateContainer.appendChild(newTemplate);
    }
}
