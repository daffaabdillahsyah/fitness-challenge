document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const questsContainer = document.getElementById('questsContainer');
    const createQuestForm = document.getElementById('createQuestForm');
    const editQuestForm = document.getElementById('editQuestForm');
    const createQuestBtn = document.getElementById('createQuestBtn');

    // Show/hide create quest button based on login status
    if (token && createQuestBtn) {
        createQuestBtn.classList.remove('d-none');
    }

    // Load all quests when page loads
    loadQuests();

    // Add event listeners
    if (createQuestForm) {
        createQuestForm.addEventListener('submit', handleCreateQuest);
    }
    if (editQuestForm) {
        editQuestForm.addEventListener('submit', handleEditQuest);
    }

    // Function to load all quests
    function loadQuests() {
        fetchMethod(`${currentUrl}/api/quests`, (status, response) => {
            if (status === 200) {
                displayQuests(response);
                if (token) {
                    updateQuestStatus();
                }
            } else {
                showMessage("Error loading quests", "error");
            }
        });
    }

    // Function to display quests
    function displayQuests(quests) {
        if (!questsContainer) return;

        questsContainer.innerHTML = quests.map(quest => {
            const isLoggedIn = !!token;
            let startButton;
            
            if (!isLoggedIn) {
                startButton = `<a href="login.html" class="btn btn-primary">Login to Start</a>`;
            } else {
                // Check if quest is in localStorage as "starting"
                const startingQuests = JSON.parse(localStorage.getItem('startingQuests') || '[]');
                if (startingQuests.includes(quest.id)) {
                    startButton = `<button class="btn btn-warning start-quest" disabled>Starting...</button>`;
                } else {
                    startButton = `<button class="btn btn-success start-quest" onclick="window.startQuest(${quest.id})">Start Quest</button>`;
                }
            }
            
            const adminButtons = isLoggedIn ? 
                `<div class="btn-group">
                    <button class="btn btn-warning" onclick="window.editQuest(${quest.id})">Edit</button>
                    <button class="btn btn-danger" onclick="window.deleteQuest(${quest.id})">Delete</button>
                </div>` : '';

            return `
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        ${quest.imageUrl ? `<img src="${quest.imageUrl}" class="card-img-top" alt="${quest.title}" style="height: 200px; object-fit: cover;">` : ''}
                        <div class="card-body">
                            <h5 class="card-title">${quest.title}</h5>
                            <p class="card-text">${quest.description || 'No description available.'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="badge bg-primary">${quest.points} Points</span>
                                    <span class="badge bg-${getDifficultyBadgeClass(quest.difficulty)}">${quest.difficulty}</span>
                                </div>
                                <div class="btn-group">
                                    ${startButton}
                                    ${adminButtons}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Function to handle quest creation
    function handleCreateQuest(event) {
        event.preventDefault();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            imageUrl: document.getElementById('imageUrl').value,
            points: parseInt(document.getElementById('points').value),
            difficulty: document.getElementById('difficulty').value
        };

        fetchMethod(`${currentUrl}/api/quests`, (status, response) => {
            if (status === 201) {
                showMessage("Quest created successfully!", "success");
                loadQuests();
                document.getElementById('createQuestModal').querySelector('.btn-close').click();
            } else {
                showMessage(response.message || "Error creating quest", "error");
            }
        }, "POST", formData, token);
    }

    // Function to handle quest editing
    function editQuest(questId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        fetchMethod(`${currentUrl}/api/quests/${questId}`, (status, response) => {
            if (status === 200) {
                document.getElementById('editQuestId').value = questId;
                document.getElementById('editTitle').value = response.title;
                document.getElementById('editDescription').value = response.description;
                document.getElementById('editImageUrl').value = response.imageUrl || '';
                document.getElementById('editPoints').value = response.points;
                document.getElementById('editDifficulty').value = response.difficulty;
                new bootstrap.Modal(document.getElementById('editQuestModal')).show();
            }
        }, "GET", null, token);
    }

    // Function to handle quest update
    function handleEditQuest(event) {
        event.preventDefault();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const questId = document.getElementById('editQuestId').value;
        const formData = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            imageUrl: document.getElementById('editImageUrl').value,
            points: parseInt(document.getElementById('editPoints').value),
            difficulty: document.getElementById('editDifficulty').value
        };

        fetchMethod(`${currentUrl}/api/quests/${questId}`, (status, response) => {
            if (status === 200) {
                showMessage("Quest updated successfully!", "success");
                loadQuests();
                document.getElementById('editQuestModal').querySelector('.btn-close').click();
            } else {
                showMessage(response.message || "Error updating quest", "error");
            }
        }, "PUT", formData, token);
    }

    // Function to delete quest
    function deleteQuest(questId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        if (confirm("Are you sure you want to delete this quest?")) {
            fetchMethod(`${currentUrl}/api/quests/${questId}`, (status, response) => {
                if (status === 200) {
                    showMessage("Quest deleted successfully!", "success");
                    loadQuests();
                } else {
                    showMessage(response.message || "Error deleting quest", "error");
                }
            }, "DELETE", null, token);
        }
    }

    // Function to update quest status
    function updateQuestStatus() {
        if (!token) return;

        fetchMethod(`${currentUrl}/api/quests/active`, (status, response) => {
            if (status === 200) {
                console.log("Active quests:", response);
                const activeQuests = new Set(response.map(q => q.id));
                
                // Update buttons in quest list
                document.querySelectorAll('.start-quest').forEach(button => {
                    const questId = parseInt(button.getAttribute('onclick').match(/\d+/)[0]);
                    if (activeQuests.has(questId)) {
                        button.textContent = 'In Progress';
                        button.disabled = true;
                        button.classList.replace('btn-success', 'btn-warning');
                    }
                });
                
                // Update active quests section in index page
                const activeQuestsContainer = document.getElementById('activeQuests');
                if (activeQuestsContainer) {
                    if (response.length > 0) {
                        activeQuestsContainer.innerHTML = response.map(quest => `
                            <div class="col-md-6 mb-4">
                                <div class="card h-100">
                                    ${quest.imageUrl ? `<img src="${quest.imageUrl}" class="card-img-top" alt="${quest.title}" style="height: 200px; object-fit: cover;">` : ''}
                                    <div class="card-body">
                                        <h5 class="card-title">${quest.title}</h5>
                                        <p class="card-text">${quest.description || 'No description available.'}</p>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span class="badge bg-primary">${quest.points} Points</span>
                                                <span class="badge bg-${getDifficultyBadgeClass(quest.difficulty)}">${quest.difficulty}</span>
                                            </div>
                                            <button class="btn btn-primary" onclick="window.completeQuest(${quest.id})">Complete Quest</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        activeQuestsContainer.innerHTML = '<div class="col-12"><p class="text-muted">No active quests</p></div>';
                    }
                }
            } else {
                console.error("Error fetching active quests:", response);
                if (activeQuestsContainer) {
                    activeQuestsContainer.innerHTML = '<div class="col-12"><p class="text-danger">Error loading active quests</p></div>';
                }
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

    // Helper function to get badge class for difficulty
    function getDifficultyBadgeClass(difficulty) {
        switch(difficulty.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            default: return 'secondary';
        }
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

    // Function to load active quests
    function loadActiveQuests() {
        fetch('/api/quests/active')
            .then(response => response.json())
            .then(quests => {
                const activeQuestsContainer = document.getElementById('activeQuests');
                if (!activeQuestsContainer) {
                    console.error('Active quests container not found');
                    return;
                }

                if (quests.length === 0) {
                    activeQuestsContainer.innerHTML = '<p class="text-muted">No active quests found.</p>';
                    return;
                }

                const questsHtml = quests.map(quest => `
                    <div class="quest-card mb-3" data-quest-id="${quest.id}">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${quest.title}</h5>
                                <p class="card-text">${quest.description}</p>
                                <div class="quest-details">
                                    <span class="badge bg-primary">${quest.difficulty}</span>
                                    <span class="badge bg-info">XP: ${quest.xp_reward}</span>
                                </div>
                                <button class="btn btn-success mt-2" onclick="completeQuest(${quest.id})">
                                    Complete Quest
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                activeQuestsContainer.innerHTML = questsHtml;
            })
            .catch(error => {
                console.error('Error loading active quests:', error);
                const activeQuestsContainer = document.getElementById('activeQuests');
                if (activeQuestsContainer) {
                    activeQuestsContainer.innerHTML = '<p class="text-danger">Error loading active quests. Please try again later.</p>';
                }
            });
    }

    // Function to complete a quest
    function completeQuest(questId) {
        fetch(`/api/quests/${questId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Success', 'Quest completed successfully!', 'success');
                loadActiveQuests(); // Refresh the active quests list
                updateUserStats(); // Update user stats if needed
            } else {
                showToast('Error', data.message || 'Failed to complete quest', 'error');
            }
        })
        .catch(error => {
            console.error('Error completing quest:', error);
            showToast('Error', 'Failed to complete quest. Please try again.', 'error');
        });
    }

    // Make functions globally available
    window.startQuest = function(questId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Save starting state to localStorage
        const startingQuests = JSON.parse(localStorage.getItem('startingQuests') || '[]');
        if (!startingQuests.includes(questId)) {
            startingQuests.push(questId);
            localStorage.setItem('startingQuests', JSON.stringify(startingQuests));
        }

        // Find and disable the button, change text to "Starting..."
        const startButton = document.querySelector(`button[onclick="window.startQuest(${questId})"]`);
        if (startButton) {
            startButton.disabled = true;
            startButton.textContent = 'Starting...';
            startButton.classList.replace('btn-success', 'btn-warning');
        }

        fetchMethod(`${currentUrl}/api/quests/${questId}/start`, (status, response) => {
            // Remove from starting state regardless of success/failure
            const startingQuests = JSON.parse(localStorage.getItem('startingQuests') || '[]');
            const updatedStartingQuests = startingQuests.filter(id => id !== questId);
            localStorage.setItem('startingQuests', JSON.stringify(updatedStartingQuests));

            if (status === 200) {
                showMessage("Quest started successfully!", "success");
                // Immediately update the button state
                if (startButton) {
                    startButton.textContent = 'In Progress';
                    startButton.disabled = true;
                    startButton.classList.replace('btn-warning', 'btn-warning');
                }
                // Update both quest status and user stats
                updateQuestStatus();
                updateUserStats();
                // If we're on the index page, reload active quests
                const activeQuestsContainer = document.getElementById('activeQuests');
                if (activeQuestsContainer) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                showMessage(response.message || "Error starting quest", "error");
                // Reset button state if there was an error
                if (startButton) {
                    startButton.disabled = false;
                    startButton.textContent = 'Start Quest';
                    startButton.classList.replace('btn-warning', 'btn-success');
                }
            }
        }, "POST", null, token);
    };

    window.editQuest = editQuest;
    window.deleteQuest = deleteQuest;
    window.completeQuest = function(questId) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        fetchMethod(`${currentUrl}/api/quests/${questId}/complete`, (status, response) => {
            if (status === 200) {
                showMessage("Quest completed successfully!", "success");
                updateQuestStatus();
                updateUserStats();
            } else {
                showMessage(response.message || "Error completing quest", "error");
            }
        }, "POST", null, token);
    };
}); 