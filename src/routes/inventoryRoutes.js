//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////

// All inventory routes require authentication
router.use(jwtMiddleware.verifyToken);

// Get user's inventory
router.get("/", inventoryController.getUserInventory);

// Add item to inventory
router.post("/:id/add", inventoryController.addItemToInventory);

// Update item quantity
router.put("/:id/quantity", inventoryController.updateItemQuantity);

// Remove item from inventory
router.delete("/:id", inventoryController.removeItemFromInventory);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router; 