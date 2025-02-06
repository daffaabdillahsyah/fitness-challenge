//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const reviewModel = require("../models/reviewModel");

//////////////////////////////////////////////////////
// CREATE REVIEW
//////////////////////////////////////////////////////
module.exports.createReview = (req, res) => {
    if (!req.body.challenge_id || !req.body.rating) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const data = {
        user_id: res.locals.userId,
        challenge_id: req.body.challenge_id,
        rating: req.body.rating,
        comment: req.body.comment || null
    };

    // First check if user has already reviewed this challenge
    reviewModel.checkExistingReview(data, (error, results) => {
        if (error) {
            console.error("Error checking existing review:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "You have already reviewed this challenge" });
        }

        // If no existing review, create new one
        reviewModel.createReview(data, (error, results) => {
            if (error) {
                console.error("Error creating review:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.status(201).json({
                message: "Review created successfully",
                reviewId: results.insertId
            });
        });
    });
};

//////////////////////////////////////////////////////
// GET ALL REVIEWS
//////////////////////////////////////////////////////
module.exports.getAllReviews = (req, res) => {
    reviewModel.getAllReviews((error, results) => {
        if (error) {
            console.error("Error getting reviews:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// GET USER'S REVIEWS
//////////////////////////////////////////////////////
module.exports.getUserReviews = (req, res) => {
    reviewModel.getUserReviews(res.locals.userId, (error, results) => {
        if (error) {
            console.error("Error getting user reviews:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// UPDATE REVIEW
//////////////////////////////////////////////////////
module.exports.updateReview = (req, res) => {
    if (!req.params.id || !req.body.rating) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const data = {
        review_id: req.params.id,
        user_id: res.locals.userId,
        rating: req.body.rating,
        comment: req.body.comment || null
    };

    reviewModel.updateReview(data, (error, results) => {
        if (error) {
            console.error("Error updating review:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        res.status(200).json({ message: "Review updated successfully" });
    });
};

//////////////////////////////////////////////////////
// DELETE REVIEW
//////////////////////////////////////////////////////
module.exports.deleteReview = (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ message: "Review ID is required" });
    }

    const data = {
        review_id: req.params.id,
        user_id: res.locals.userId
    };

    reviewModel.deleteReview(data, (error, results) => {
        if (error) {
            console.error("Error deleting review:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        res.status(200).json({ message: "Review deleted successfully" });
    });
}; 