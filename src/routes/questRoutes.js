//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const questController = require("../controllers/questController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////

// Get all quests (public)
router.get("/", questController.getAllQuests);

// Protected routes (require authentication)
router.use(jwtMiddleware.verifyToken);

// Get user's quests
router.get("/user", questController.getUserQuests);

// Get active quests
router.get("/active", questController.getActiveQuests);

// Start a quest
router.post("/:id/start", questController.startQuest);

// Complete a quest
router.post("/:id/complete", questController.completeQuest);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router; 