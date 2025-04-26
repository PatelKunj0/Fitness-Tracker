document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-form").addEventListener("submit", async e => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return alert(data.error);
      }

      // Save the current user
      localStorage.setItem("currentUser", username);

      // Fetch any saved templates from the server
      const tplRes = await fetch(`/templates?username=${encodeURIComponent(username)}`);
      const templates = tplRes.ok ? await tplRes.json() : [];

      // Initialize their localStorage entry
      localStorage.setItem(username, JSON.stringify({ templates }));

      // Go to the homepage
      window.location.href = "index.html";

    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    }
  });
});
