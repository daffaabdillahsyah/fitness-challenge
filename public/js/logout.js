document.addEventListener('DOMContentLoaded', function() {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    
    // Show a message (optional)
    const message = document.createElement('div');
    message.className = 'alert alert-success';
    message.textContent = 'You have been successfully logged out.';
    document.querySelector('.container').appendChild(message);
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}); 