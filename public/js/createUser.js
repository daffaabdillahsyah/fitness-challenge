document.addEventListener("DOMContentLoaded", function () {
    const createPlayerForm = document.getElementById("createPlayerForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");

    // Function to display warnings
    function showWarning(message) {
        warningCard.classList.remove("d-none");
        warningText.innerText = message;
    }

    // Function to hide warnings
    function hideWarning() {
        warningCard.classList.add("d-none");
        warningText.innerText = "";
    }

    createPlayerForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const playername = document.getElementById("playername").value.trim();
        
        // Validate input fields
        if (!playername) {
            showWarning("Player name cannot be empty.");
            return;
        }

        // Prepare data
        const data = {
            name: playername,
            level: 1
        };

        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found in localStorage");
            showWarning("Authentication required. Please login first.");
            return;
        }

        try {
            // Use async/await with fetch for better error handling
            const response = await fetch(`${currentUrl}/api/player`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log("Player created successfully:", responseData);
                
                // Reset form and hide warnings
                createPlayerForm.reset();
                hideWarning();

                // Redirect to profile or another relevant page
                window.location.href = "profile.html"; 
            } else {
                console.error("Error creating player:", responseData);
                showWarning(responseData.message || "Failed to create player.");
            }
        } catch (error) {
            console.error("Request error:", error);
            showWarning("An error occurred. Please try again.");
        }
    });
});
