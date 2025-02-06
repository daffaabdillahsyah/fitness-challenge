document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    let selectedChallengeId = null;
    let editingReviewId = null;

    // Load reviews when page loads
    loadAllReviews();

    // Add event listener to challenge select
    const challengeSelect = document.getElementById('challengeSelect');
    if (challengeSelect) {
        challengeSelect.addEventListener('change', function() {
            selectedChallengeId = this.value;
        });
    }

    // Add event listener to rating stars
    document.querySelectorAll('.rating i').forEach(star => {
        star.addEventListener('click', function() {
            if (!token) {
                showMessage("Please login to submit a review", "warning");
                return;
            }
            const rating = this.getAttribute('data-value');
            document.getElementById('ratingValue').textContent = rating;
            
            // Update star colors
            document.querySelectorAll('.rating i').forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('text-warning');
                } else {
                    s.classList.remove('text-warning');
                }
            });
        });
    });

    // Function to load all reviews
    function loadAllReviews() {
        fetchMethod(`${currentUrl}/api/reviews`, (status, data) => {
            if (status === 200) {
                displayReviews(data);
            } else {
                showMessage("Error loading reviews", "error");
            }
        }, "GET");
    }

    // Function to display reviews
    function displayReviews(reviews) {
        const reviewsContainer = document.getElementById("reviewsContainer");
        if (!reviewsContainer) return;

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="alert alert-info">No reviews yet. Be the first to review!</div>';
            return;
        }

        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="card mb-3 review-card" id="review-${review.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">${review.username}</h5>
                        <div class="rating-display">
                            ${displayStars(review.rating)}
                        </div>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted mt-2">${review.challenge_title}</h6>
                    <p class="card-text">${review.comment || 'No comment provided.'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Posted on: ${new Date(review.created_at).toLocaleDateString()}</small>
                        ${token && review.user_id === getUserIdFromToken() ? `
                            <div>
                                <button class="btn btn-sm btn-primary edit-review me-2" data-review-id="${review.id}" 
                                    data-rating="${review.rating}" data-comment="${review.comment || ''}" 
                                    data-challenge-id="${review.challenge_id}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-review" data-review-id="${review.id}">Delete</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to buttons
        addReviewButtonListeners();
    }

    // Function to display star rating
    function displayStars(rating) {
        return Array(5).fill(0).map((_, index) => 
            `<i class="fas fa-star ${index < rating ? 'text-warning' : 'text-muted'}"></i>`
        ).join('');
    }

    // Function to submit/update a review
    window.submitReview = function() {
        if (!token) {
            showMessage("Please login to submit a review", "warning");
            return;
        }

        if (!selectedChallengeId && !editingReviewId) {
            showMessage("Please select a challenge to review", "warning");
            return;
        }

        const rating = document.getElementById('ratingValue').textContent;
        const comment = document.getElementById('reviewComment')?.value || '';

        if (!rating || rating === "0") {
            showMessage("Please select a rating", "warning");
            return;
        }

        const data = {
            rating: parseInt(rating),
            comment: comment
        };

        if (editingReviewId) {
            // Update existing review
            fetchMethod(`${currentUrl}/api/reviews/${editingReviewId}`, (status, response) => {
                if (status === 200) {
                    showMessage("Review updated successfully", "success");
                    loadAllReviews();
                    resetReviewForm();
                    editingReviewId = null;
                    document.querySelector('button[type="submit"]').textContent = "Submit Review";
                } else {
                    showMessage(response.message || "Error updating review", "error");
                }
            }, "PUT", data, token);
        } else {
            // Create new review
            data.challenge_id = selectedChallengeId;
            fetchMethod(`${currentUrl}/api/reviews`, (status, response) => {
                if (status === 201) {
                    showMessage("Review submitted successfully", "success");
                    loadAllReviews();
                    resetReviewForm();
                } else {
                    showMessage(response.message || "Error submitting review", "error");
                }
            }, "POST", data, token);
        }
    };

    // Function to delete a review
    function deleteReview(reviewId) {
        if (!token) return;

        if (confirm("Are you sure you want to delete this review?")) {
            fetchMethod(`${currentUrl}/api/reviews/${reviewId}`, (status, response) => {
                if (status === 200) {
                    showMessage("Review deleted successfully", "success");
                    loadAllReviews();
                } else {
                    showMessage(response.message || "Error deleting review", "error");
                }
            }, "DELETE", null, token);
        }
    }

    // Function to edit a review
    function editReview(reviewId, rating, comment, challengeId) {
        editingReviewId = reviewId;
        selectedChallengeId = challengeId;
        
        // Update form with existing review data
        document.getElementById('ratingValue').textContent = rating;
        document.getElementById('reviewComment').value = comment;
        
        // Update star display
        document.querySelectorAll('.rating i').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('text-warning');
            } else {
                star.classList.remove('text-warning');
            }
        });

        // Update submit button text
        document.querySelector('button[onclick="submitReview()"]').textContent = "Update Review";

        // Scroll to review form
        document.querySelector('.card.mb-4').scrollIntoView({ behavior: 'smooth' });
    }

    // Add event listeners to review buttons
    function addReviewButtonListeners() {
        document.querySelectorAll('.delete-review').forEach(button => {
            button.addEventListener('click', () => deleteReview(button.dataset.reviewId));
        });

        document.querySelectorAll('.edit-review').forEach(button => {
            button.addEventListener('click', () => {
                const { reviewId, rating, comment, challengeId } = button.dataset;
                editReview(reviewId, parseInt(rating), comment, challengeId);
            });
        });
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

    // Helper function to reset review form
    function resetReviewForm() {
        document.getElementById('ratingValue').textContent = "0";
        document.querySelectorAll('.rating i').forEach(star => star.classList.remove('text-warning'));
        if (document.getElementById('reviewComment')) {
            document.getElementById('reviewComment').value = '';
        }
        if (document.getElementById('challengeSelect')) {
            document.getElementById('challengeSelect').value = '';
        }
        selectedChallengeId = null;
        editingReviewId = null;
        document.querySelector('button[onclick="submitReview()"]').textContent = "Submit Review";
    }

    // Helper function to get user ID from token
    function getUserIdFromToken() {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch (e) {
            return null;
        }
    }
}); 