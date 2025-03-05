document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        // Redirect to homepage after login
        window.location.href = "index.html"; 
    });
});
