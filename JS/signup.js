document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Check if user exists
        let userData = localStorage.getItem(username);
        if (!userData) {
            alert("User does not exist. Please sign up.");
            return;
        }

        userData = JSON.parse(userData);
        if (userData.password !== password) {
            alert("Incorrect password. Please try again.");
            return;
        }

        // Save logged in user to localStorage
        localStorage.setItem("currentUser", username);

        alert("Login successful!");
        window.location.href = "index.html"; 
    });
});
