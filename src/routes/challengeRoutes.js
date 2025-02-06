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

// Public routes
router.get("/", challengeController.getAllChallenges);
router.get("/:id", challengeController.getChallengeById);

// Protected routes (require authentication)
router.use(jwtMiddleware.verifyToken);

// Get user's challenges
router.get("/user", challengeController.getUserChallenges);

// Create new challenge
router.post("/", challengeController.createChallenge);

// Update challenge
router.put("/:id", challengeController.updateChallenge);

// Delete challenge
router.delete("/:id", challengeController.deleteChallenge);

// Join a challenge
router.post("/:id/join", challengeController.joinChallenge);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router; 