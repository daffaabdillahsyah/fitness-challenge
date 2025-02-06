//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const inventoryModel = require("../models/inventoryModel");

//////////////////////////////////////////////////////
// GET USER INVENTORY
//////////////////////////////////////////////////////
module.exports.getUserInventory = (req, res) => {
    inventoryModel.getUserInventory(res.locals.userId, (error, results) => {
        if (error) {
            console.error("Error getting user inventory:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// ADD ITEM TO INVENTORY
//////////////////////////////////////////////////////
module.exports.addItemToInventory = (req, res) => {
    const data = {
        user_id: res.locals.userId,
        item_id: req.params.id,
        quantity: req.body.quantity || 1
    };

    inventoryModel.addItemToInventory(data, (error, results) => {
        if (error) {
            console.error("Error adding item to inventory:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({ message: "Successfully added item to inventory" });
    });
};

//////////////////////////////////////////////////////
// UPDATE ITEM QUANTITY
//////////////////////////////////////////////////////
module.exports.updateItemQuantity = (req, res) => {
    if (!req.body.quantity) {
        return res.status(400).json({ message: "Quantity is required" });
    }

    const data = {
        user_id: res.locals.userId,
        item_id: req.params.id,
        quantity: req.body.quantity
    };

    inventoryModel.updateItemQuantity(data, (error, results) => {
        if (error) {
            console.error("Error updating item quantity:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({ message: "Successfully updated item quantity" });
    });
};

//////////////////////////////////////////////////////
// REMOVE ITEM FROM INVENTORY
//////////////////////////////////////////////////////
module.exports.removeItemFromInventory = (req, res) => {
    const data = {
        user_id: res.locals.userId,
        item_id: req.params.id
    };

    inventoryModel.removeItemFromInventory(data, (error, results) => {
        if (error) {
            console.error("Error removing item from inventory:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({ message: "Successfully removed item from inventory" });
    });
};

//////////////////////////////////////////////////////
// ADD INITIAL ITEMS FOR NEW USER
//////////////////////////////////////////////////////
module.exports.addInitialItemsForNewUser = (req, res, next) => {
    const userId = res.locals.userId;

    inventoryModel.addInitialItems(userId, (error, results) => {
        if (error) {
            console.error("Error adding initial items:", error);
            // Continue to next middleware even if adding items fails
            // This way user registration still completes
            next();
        } else {
            console.log("Initial items added successfully for user:", userId);
            next();
        }
    });
}; 