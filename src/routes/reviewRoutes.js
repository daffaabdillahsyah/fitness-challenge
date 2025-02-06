//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////

// Get all reviews (public)
router.get("/", reviewController.getAllReviews);

// Protected routes (require authentication)
router.use(jwtMiddleware.verifyToken);

// Get user's reviews
router.get("/user", reviewController.getUserReviews);

// Create review
router.post("/", reviewController.createReview);

// Update review
router.put("/:id", reviewController.updateReview);

// Delete review
router.delete("/:id", reviewController.deleteReview);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router; 