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
document.addEventListener("DOMContentLoaded", () => {
    loadTemplates();

    // Add event listener for See Stats button
    const seeStatsBtn = document.getElementById("see-stats-btn");
    if (seeStatsBtn) {
        seeStatsBtn.addEventListener("click", () => {
            // Navigate to the stats page (view_template.html assumed)
            window.location.href = "view_template.html";
        });
    }
});

function loadTemplates() {
    const username = localStorage.getItem("currentUser");
    if (!username) return;
  
    const userData = JSON.parse(localStorage.getItem(username));
    if (!userData || !userData.templates) return;
  
    const container = document.getElementById("templates-container");
    container.innerHTML = "";
  
    userData.templates.forEach((template) => {
      // Create the outer card
      const card = document.createElement("div");
      card.classList.add("template-box");
  
      // More options button
      const moreOptionsBtn = document.createElement("button");
      moreOptionsBtn.classList.add("more-options-btn");
      moreOptionsBtn.textContent = "...";
      // For example, open a pop-up with rename/delete options
      moreOptionsBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // so it doesn't trigger the card click
        openTemplateOptions(template.name);
      });
      card.appendChild(moreOptionsBtn);
  
      // Title (h3)
      const title = document.createElement("h3");
      title.textContent = template.name;
      card.appendChild(title);
  
      // Short preview of exercises
      const exercisesPreview = document.createElement("p");
      exercisesPreview.classList.add("template-exercises");
      // For example, show the first 2-3 exercises
      exercisesPreview.textContent = template.exercises.slice(0, 3).map(e => e.name).join(", ");
      card.appendChild(exercisesPreview);
  
      // Last performed or some date
      const meta = document.createElement("p");
      meta.classList.add("template-meta");
      if (template.lastPerformed) {
        // Calculate how many days ago
        let days = calculateDaysAgo(new Date(template.lastPerformed), new Date());
        meta.textContent = `${days} days ago`;
      } else {
        meta.textContent = "No workouts yet";
      }
      card.appendChild(meta);
  
      // Clicking the card goes to view_template.html
      card.addEventListener("click", () => {
        window.location.href = `view_template.html?template=${encodeURIComponent(template.name)}`;
      });
  
      container.appendChild(card);
    });
  }
  
  function calculateDaysAgo(oldDate, newDate) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Math.floor((newDate - oldDate) / oneDayMs);
  }
  
function addTemplate() {
    window.location.href = 'template.html';
}