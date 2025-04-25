document.getElementById("signup-form").addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
    .then(r => r.json().then(data => {
      if (!r.ok) return alert(data.error);
      alert("Account created!");
      window.location.href = "login.html";
    }));
  });
  