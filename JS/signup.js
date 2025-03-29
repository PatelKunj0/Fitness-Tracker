document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("new-username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("new-password").value;

    // Email validation
    const allowedDomains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "hotmail.com"];
    const emailParts = email.split("@");
    
    // Check 1: Basic format validation
    if (emailParts.length !== 2 || !emailParts[1].includes(".")) {
        alert("Please enter a valid email address (e.g., user@gmail.com)");
        return;
    }

    // Check 2: Domain validation
    const domain = emailParts[1].toLowerCase();
    if (!allowedDomains.includes(domain)) {
        alert("We only accept emails from: Gmail, Outlook, Yahoo, iCloud, or Hotmail");
        return;
    }

    // Check if user exists
    if (localStorage.getItem(username)) {
        alert("Username already exists. Please choose another.");
        return;
    }

    // Save user data (Note: In production, hash the password!)
    localStorage.setItem(username, JSON.stringify({
        username: username,
        email: email,
        password: password // Replace with hashed password later
    }));

    alert("Account created successfully!");
    window.location.href = "login.html";
});