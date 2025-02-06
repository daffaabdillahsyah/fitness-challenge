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

// Public routes (no authentication required)
router.get("/", questController.getAllQuests);

// Protected routes (require authentication)
router.use(jwtMiddleware.verifyToken);

// Get active quests (must be before /:id route)
router.get("/active", questController.getActiveQuests);

// Get quest by ID
router.get("/:id", questController.getQuestById);

// Get user's quests
router.get("/user", questController.getUserQuests);

// Create new quest
router.post("/", questController.createQuest);

// Update quest
router.put("/:id", questController.updateQuest);

// Delete quest
router.delete("/:id", questController.deleteQuest);

// Start a quest
router.post("/:id/start", questController.startQuest);

// Complete a quest
router.post("/:id/complete", questController.completeQuest);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router; 