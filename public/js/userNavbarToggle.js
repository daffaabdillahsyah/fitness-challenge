document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const logoutButton = document.getElementById("logoutButton");
  
    function updateNavbarButtons() {
        const token = localStorage.getItem("token");
        if (token) {
            // Token exists, show logout button and hide login and register buttons
            loginButton.classList.add("d-none");
            registerButton.classList.add("d-none");
            logoutButton.classList.remove("d-none");
        } else {
            // Token does not exist, show login and register buttons and hide logout button
            loginButton.classList.remove("d-none");
            registerButton.classList.remove("d-none");
            logoutButton.classList.add("d-none");
        }
    }

    // Initial update when page loads
    updateNavbarButtons();
  
    logoutButton.addEventListener("click", function () {
        // Remove the token from local storage and redirect to index.html
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        updateNavbarButtons();
        window.location.href = "index.html";
    });

    // Make updateNavbarButtons available globally
    window.updateNavbarButtons = updateNavbarButtons;
});