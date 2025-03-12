function addTemplate() {
    let templateName = prompt("Enter template name:");
    if (templateName && templateName.trim() !== "") {
        let username = localStorage.getItem("currentUser");
        if (!username) {
            alert("You must be logged in to add a template.");
            return;
        }

        // Load existing user data
        let userData = JSON.parse(localStorage.getItem(username));
        userData.templates.push({
            name: templateName,
            exercises: []
        });

        // Save back to localStorage
        localStorage.setItem(username, JSON.stringify(userData));

        // Create a new template button
        let templateContainer = document.getElementById("templates-container");
        let newTemplate = document.createElement("button");
        newTemplate.classList.add("template-box");
        newTemplate.textContent = templateName;

        // Navigate to template.html with template name
        newTemplate.addEventListener("click", () => {
            window.location.href = `template.html?template=${encodeURIComponent(templateName)}`;
        });

        templateContainer.appendChild(newTemplate);
    }
}
