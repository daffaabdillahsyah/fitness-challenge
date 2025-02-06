document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const challengesContainer = document.getElementById("challengesContainer");
    const createChallengeForm = document.getElementById("createChallengeForm");
    const editChallengeForm = document.getElementById("editChallengeForm");
    const createChallengeBtn = document.getElementById("createChallengeBtn");

    // Show/hide create challenge button based on login status
    if (token && createChallengeBtn) {
        createChallengeBtn.classList.remove('d-none');
    }

    // Load all challenges when page loads
    loadChallenges();

    // Add event listeners
    if (createChallengeForm) {
        createChallengeForm.addEventListener("submit", handleCreateChallenge);
    }
    if (editChallengeForm) {
        editChallengeForm.addEventListener("submit", handleEditChallenge);
    }

    // Function to load all challenges
    function loadChallenges() {
        fetchMethod(`${currentUrl}/api/challenges`, (status, response) => {
            if (status === 200) {
                displayChallenges(response);
                if (token) {
                    updateChallengeStatus();
                }
            } else {
                showMessage("Error loading challenges", "error");
            }
        });
    }

    // Function to display challenges
    function displayChallenges(challenges) {
        if (!challengesContainer) return;

        challengesContainer.innerHTML = challenges.map(challenge => {
            const isLoggedIn = !!token;
            const joinButton = isLoggedIn ? 
                `<button class="btn btn-success join-challenge" onclick="joinChallenge(${challenge.id})">Join Challenge</button>` :
                `<a href="login.html" class="btn btn-primary">Login to Join</a>`;
            
            const adminButtons = isLoggedIn ? 
                `<div class="btn-group">
                    <button class="btn btn-warning" onclick="editChallenge(${challenge.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteChallenge(${challenge.id})">Delete</button>
                </div>` : '';

            return `
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        ${challenge.imageUrl ? `<img src="${challenge.imageUrl}" class="card-img-top" alt="${challenge.title}" style="height: 200px; object-fit: cover;">` : ''}
                        <div class="card-body">
                            <h5 class="card-title">${challenge.title}</h5>
                            <p class="card-text">${challenge.description || 'No description available.'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-primary">${challenge.points} Points</span>
                                <div class="btn-group">
                                    ${joinButton}
                                    ${adminButtons}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Function to handle challenge creation
    function handleCreateChallenge(event) {
        event.preventDefault();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            imageUrl: document.getElementById('imageUrl').value,
            points: parseInt(document.getElementById('points').value)
        };

        fetchMethod(`${currentUrl}/api/challenges`, (status, response) => {
            if (status === 201) {
                showMessage("Challenge created successfully!", "success");
                loadChallenges();
                document.getElementById('createChallengeModal').querySelector('.btn-close').click();
            } else {
                showMessage(response.message || "Error creating challenge", "error");
            }
        }, "POST", formData, token);
    }

    // Function to handle challenge editing
    function editChallenge(challengeId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        fetchMethod(`${currentUrl}/api/challenges/${challengeId}`, (status, response) => {
            if (status === 200) {
                document.getElementById('editChallengeId').value = challengeId;
                document.getElementById('editTitle').value = response.title;
                document.getElementById('editDescription').value = response.description;
                document.getElementById('editImageUrl').value = response.imageUrl || '';
                document.getElementById('editPoints').value = response.points;
                new bootstrap.Modal(document.getElementById('editChallengeModal')).show();
            }
        }, "GET", null, token);
    }

    // Function to handle challenge update
    function handleEditChallenge(event) {
        event.preventDefault();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const challengeId = document.getElementById('editChallengeId').value;
        const formData = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            imageUrl: document.getElementById('editImageUrl').value,
            points: parseInt(document.getElementById('editPoints').value)
        };

        fetchMethod(`${currentUrl}/api/challenges/${challengeId}`, (status, response) => {
            if (status === 200) {
                showMessage("Challenge updated successfully!", "success");
                loadChallenges();
                document.getElementById('editChallengeModal').querySelector('.btn-close').click();
            } else {
                showMessage(response.message || "Error updating challenge", "error");
            }
        }, "PUT", formData, token);
    }

    // Function to delete challenge
    function deleteChallenge(challengeId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        if (confirm("Are you sure you want to delete this challenge?")) {
            fetchMethod(`${currentUrl}/api/challenges/${challengeId}`, (status, response) => {
                if (status === 200) {
                    showMessage("Challenge deleted successfully!", "success");
                    loadChallenges();
                } else {
                    showMessage(response.message || "Error deleting challenge", "error");
                }
            }, "DELETE", null, token);
        }
    }

    // Function to join challenge
    function joinChallenge(challengeId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        fetchMethod(`${currentUrl}/api/challenges/${challengeId}/join`, (status, response) => {
            if (status === 200) {
                showMessage(`Challenge joined! You earned ${response.pointsGained} points and ${response.experienceGained} XP!`, "success");
                updateUserStats();
                updateChallengeStatus();
            } else {
                showMessage(response.message || "Error joining challenge", "error");
            }
        }, "POST", null, token);
    }

    // Function to update challenge status
    function updateChallengeStatus() {
        if (!token) return;

        fetchMethod(`${currentUrl}/api/challenges/user`, (status, response) => {
            if (status === 200) {
                const joinedChallenges = new Set(response.map(c => c.id));
                document.querySelectorAll('.join-challenge').forEach(button => {
                    const challengeId = parseInt(button.getAttribute('onclick').match(/\d+/)[0]);
                    if (joinedChallenges.has(challengeId)) {
                        button.textContent = 'Joined';
                        button.disabled = true;
                        button.classList.replace('btn-success', 'btn-secondary');
                    }
                });
            }
        }, "GET", null, token);
    }

    // Function to update user stats
    function updateUserStats() {
        if (!token) return;
        
        fetchMethod(`${currentUrl}/api/user/profile`, (status, response) => {
            if (status === 200) {
                const statsElements = {
                    skillPoints: document.getElementById('skillPoints'),
                    experiencePoints: document.getElementById('xp'),
                    level: document.getElementById('level')
                };

                if (statsElements.skillPoints) statsElements.skillPoints.textContent = response.skill_points;
                if (statsElements.experiencePoints) statsElements.experiencePoints.textContent = `${response.experience_points} XP`;
                if (statsElements.level) statsElements.level.textContent = response.level;
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

    // Make functions globally available
    window.editChallenge = editChallenge;
    window.deleteChallenge = deleteChallenge;
    window.joinChallenge = joinChallenge;
}); 