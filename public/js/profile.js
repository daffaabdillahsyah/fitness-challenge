document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Get user profile elements
    const usernameElement = document.getElementById('username');
    const levelElement = document.getElementById('level');
    const skillPointsElement = document.getElementById('skillPoints');
    const experienceElement = document.getElementById('xp');

    // Fetch user profile data
    fetchMethod(`${currentUrl}/api/user/profile`, (status, response) => {
        if (status === 200) {
            // Update profile information
            usernameElement.textContent = response.username;
            levelElement.textContent = response.level;
            skillPointsElement.textContent = response.skill_points;
            experienceElement.textContent = `${response.experience_points} XP`;
        } else {
            console.error('Error fetching profile:', response);
            // Handle error - maybe show a message to the user
            showMessage('Error loading profile data', 'error');
        }
    }, 'GET', null, token);

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
}); 