document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");
  const submitButton = signupForm.querySelector("button[type='submit']");

  signupForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Clear previous warnings
      warningCard.classList.add("d-none");
      warningText.innerText = "";

      //  **Validation Rules**
      if (username.length < 3) {
          showWarning("Username must be at least 3 characters long.");
          return;
      }

      if (!validateEmail(email)) {
          showWarning("Invalid email format.");
          return;
      }

      if (!validatePassword(password)) {
          showWarning("Password must be at least 8 characters, include a number, uppercase, and special character.");
          return;
      }

      if (password !== confirmPassword) {
          showWarning("Passwords do not match.");
          return;
      }

      //  **Prepare Data for API**
      const data = { username, email, password };

      try {
          //  Disable button to prevent multiple requests
          submitButton.disabled = true;
          submitButton.innerText = "Registering...";

          //  **Send Request**
          const response = await fetch(`${currentUrl}/api/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
          });

          const responseData = await response.json();
          console.log("Response:", responseData);

          if (response.ok) {
              // **Success: Store JWT Token & Redirect**
              localStorage.setItem("token", responseData.token);
              window.location.href = "profile.html";
          } else {
              //  **Server-side validation error**
              showWarning(responseData.message || "Registration failed.");
          }
      } catch (error) {
          //  **Handle Network Errors**
          showWarning("Network error. Please try again.");
          console.error("Signup Error:", error);
      } finally {
          //  **Re-enable Button**
          submitButton.disabled = false;
          submitButton.innerText = "Register";
      }
  });

  //  **Helper Functions**
  function showWarning(message) {
      warningCard.classList.remove("d-none");
      warningText.innerText = message;
  }

  function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }

  function validatePassword(password) {
      return (
          password.length >= 8 &&
          /[A-Z]/.test(password) &&
          /[0-9]/.test(password) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(password)
      );
  }
});
