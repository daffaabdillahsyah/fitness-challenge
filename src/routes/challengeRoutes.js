//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////

// Get all challenges (public)
router.get("/", challengeController.getAllChallenges);

// Protected routes (require authentication)
router.use(jwtMiddleware.verifyToken);

// Get user's challenges
router.get("/user", challengeController.getUserChallenges);

// Join a challenge
router.post("/:id/join", challengeController.joinChallenge);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router; 