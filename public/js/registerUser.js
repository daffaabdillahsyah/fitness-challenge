document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const registerFeedback = document.getElementById("registerFeedback");

  registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Clear previous feedback
      registerFeedback.classList.add("d-none");
      registerFeedback.textContent = "";

      // Basic validation
      if (username.length < 3) {
          showFeedback("Username must be at least 3 characters long.");
          return;
      }

      if (!validateEmail(email)) {
          showFeedback("Please enter a valid email address.");
          return;
      }

      if (password.length < 6) {
          showFeedback("Password must be at least 6 characters long.");
          return;
      }

      if (password !== confirmPassword) {
          showFeedback("Passwords do not match.");
          return;
      }

      const data = { username, email, password };

      try {
          const response = await fetch(`${currentUrl}/api/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
          });

          const responseData = await response.json();

          if (response.ok) {
              // Store token and redirect
              localStorage.setItem("token", responseData.token);
              window.location.href = "login.html";
          } else {
              showFeedback(responseData.message || "Registration failed.");
          }
      } catch (error) {
          console.error("Registration error:", error);
          showFeedback("An error occurred. Please try again.");
      }
  });

  function showFeedback(message) {
      registerFeedback.textContent = message;
      registerFeedback.classList.remove("d-none");
  }

  function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  }
});
