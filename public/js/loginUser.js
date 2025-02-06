document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginFeedback = document.getElementById("loginFeedback");
  const submitButton = loginForm.querySelector("button[type='submit']");

  loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      // Check if fields are empty
      if (!username || !password) {
          showFeedback("Username and password cannot be empty.");
          return;
      }

      const data = { username, password };

      try {
          submitButton.disabled = true; // Disable button to prevent multiple submissions

          const response = await fetch(currentUrl + "/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
          });

          const responseData = await response.json();

          if (response.ok) {
              if (responseData.token) {
                  localStorage.setItem("token", responseData.token);
                  localStorage.setItem("username", username);
                  // Update navbar buttons before redirecting
                  if (window.updateNavbarButtons) {
                      window.updateNavbarButtons();
                  }
                  window.location.href = "index.html"; // Redirect after successful login
              } else {
                  showFeedback("Login failed. Please try again.");
              }
          } else {
              showFeedback(responseData.message || "Invalid credentials.");
          }
      } catch (error) {
          console.error("Error:", error);
          showFeedback("An error occurred. Please try again later.");
      } finally {
          submitButton.disabled = false; // Re-enable button
      }
  });

  function showFeedback(message) {
      loginFeedback.textContent = message;
      loginFeedback.classList.remove("d-none");
  }
});
