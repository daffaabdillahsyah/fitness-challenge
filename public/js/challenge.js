document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    // Add event listeners to join buttons
    document.querySelectorAll('.join-challenge').forEach(button => {
        button.addEventListener('click', function() {
            const challengeId = this.getAttribute('data-challenge-id');
            joinChallenge(challengeId);
        });
    });

    // Function to join a challenge
    function joinChallenge(challengeId) {
        if (!token) {
            showMessage("Please login to join a challenge", "warning");
            return;
        }

        fetchMethod(`${currentUrl}/api/challenges/${challengeId}/join`, (status, response) => {
            if (status === 200) {
                showMessage("Successfully joined the challenge!", "success");
                // Disable the join button
                const button = document.querySelector(`[data-challenge-id="${challengeId}"]`);
                button.disabled = true;
                button.textContent = "Joined";
            } else {
                showMessage(response.message || "Error joining challenge", "error");
            }
        }, "POST", null, token);
    }

    // Helper function to show messages
    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => alertDiv.remove(), 3000);
    }
}); 