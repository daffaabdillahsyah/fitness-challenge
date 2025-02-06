document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const questsContainer = document.getElementById('questsContainer');

    // Add event listeners to start quest buttons
    document.querySelectorAll('.start-quest').forEach(button => {
        button.addEventListener('click', function() {
            const questId = this.getAttribute('data-quest-id');
            startQuest(questId);
        });
    });

    // Function to start a quest
    function startQuest(questId) {
        if (!token) {
            showMessage("Please login to start a quest", "warning");
            return;
        }

        fetchMethod(`${currentUrl}/api/quests/${questId}/start`, (status, response) => {
            if (status === 200) {
                showMessage("Successfully started the quest!", "success");
                // Disable the start button
                const button = document.querySelector(`[data-quest-id="${questId}"]`);
                button.disabled = true;
                button.textContent = "In Progress";
                button.classList.remove('btn-primary');
                button.classList.add('btn-warning');
                
                // Reload user's quests to update status
                loadUserQuests();
                
                // Update quest display on index page if it exists
                if (window.updateQuestDisplay) {
                    updateQuestDisplay();
                }
            } else {
                showMessage(response.message || "Error starting quest", "error");
            }
        }, "POST", null, token);
    }

    // Function to load user's quests
    function loadUserQuests() {
        if (!token) return;

        fetchMethod(`${currentUrl}/api/quests/user`, (status, response) => {
            if (status === 200) {
                console.log('User quests:', response); // Debug log
                response.forEach(quest => {
                    const button = document.querySelector(`[data-quest-id="${quest.id}"]`);
                    if (button) {
                        if (quest.status === 'completed') {
                            button.disabled = true;
                            button.textContent = "Completed";
                            button.classList.remove('btn-primary', 'btn-warning');
                            button.classList.add('btn-success');
                        } else if (quest.status === 'in_progress') {
                            button.disabled = true;
                            button.textContent = "In Progress";
                            button.classList.remove('btn-primary');
                            button.classList.add('btn-warning');
                        }
                    }
                });
            } else {
                console.error('Error loading user quests:', response);
            }
        }, "GET", null, token);
    }

    // Helper function to show messages
    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // Load user's quests when page loads
    loadUserQuests();
}); 