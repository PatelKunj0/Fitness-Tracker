document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault();

        // Get login data
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username && password) {
            // Save user info to localStorage
            localStorage.setItem("currentUser", username);

            // Initialize user data if not already present
            if (!localStorage.getItem(username)) {
                localStorage.setItem(username, JSON.stringify({ templates: [] }));
            }

            // Redirect to homepage
            window.location.href = "index.html"; 
        }
    });
});
