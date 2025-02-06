document.addEventListener('DOMContentLoaded', function() {
    // Get reference to leaderboard table
    const skillLeaderboard = document.getElementById('skillLeaderboard');

    // Load leaderboard when page loads
    loadLeaderboard();

    // Function to load leaderboard
    function loadLeaderboard() {
        fetchMethod(`${currentUrl}/api/user`, (status, data) => {
            if (status === 200) {
                // Sort data by skill points
                const sortedData = [...data].sort((a, b) => b.skill_points - a.skill_points);

                // Display leaderboard
                displayLeaderboard(skillLeaderboard, sortedData);
            } else {
                showMessage("Error loading leaderboard data", "error");
            }
        }, "GET");
    }

    // Function to display the leaderboard
    function displayLeaderboard(tableBody, data) {
        if (!tableBody) return;

        // Get current user's ID if logged in
        const currentUserId = getUserIdFromToken();

        tableBody.innerHTML = data.map((user, index) => {
            const isCurrentUser = currentUserId && user.id === currentUserId;
            const rowClass = isCurrentUser ? 'table-primary' : '';
            const rank = index + 1;
            const medal = getRankMedal(rank);

            return `
                <tr class="${rowClass}">
                    <td>${medal}${rank}</td>
                    <td>${user.username}${isCurrentUser ? ' (You)' : ''}</td>
                    <td>${user.skill_points}</td>
                </tr>
            `;
        }).join('');
    }

    // Function to get medal emoji based on rank
    function getRankMedal(rank) {
        switch(rank) {
            case 1: return '🥇 ';
            case 2: return '🥈 ';
            case 3: return '🥉 ';
            default: return '';
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

    // Helper function to get user ID from token
    function getUserIdFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch (e) {
            return null;
        }
    }
}); 