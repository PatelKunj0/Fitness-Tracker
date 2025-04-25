document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", e => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        })
        .then(r => r.json().then(data => {
          if (!r.ok) return alert(data.error);
          localStorage.setItem("currentUser", username);
          window.location.href = "index.html";
        }));
      });
      
});
