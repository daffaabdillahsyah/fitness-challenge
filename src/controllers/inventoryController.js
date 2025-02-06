//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

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

    // First check if user has enough experience points
    userModel.selectUserById({ id: data.user_id }, (error, user) => {
        if (error) {
            console.error("Error getting user:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!user || user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentExperience = parseInt(user[0].experience_points) || 0;
        const requiredExperience = 50 * data.quantity; // 50 XP per item

        if (currentExperience < requiredExperience) {
            return res.status(400).json({ 
                message: "Not enough experience points",
                required: requiredExperience,
                current: currentExperience
            });
        }

        // Deduct experience points and update user stats
        const newExperience = currentExperience - requiredExperience;
        const newLevel = Math.floor(newExperience / 100) + 1;

        userModel.updateUserStats(data.user_id, user[0].skill_points, newExperience, (error) => {
            if (error) {
                console.error("Error updating user stats:", error);
                return res.status(500).json({ message: "Internal server error" });
            }

            // Add item to inventory
            inventoryModel.addItemToInventory(data, (error, results) => {
                if (error) {
                    console.error("Error adding item to inventory:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }
                res.status(200).json({ 
                    message: "Successfully added item to inventory",
                    experienceDeducted: requiredExperience,
                    newExperience: newExperience,
                    newLevel: newLevel
                });
            });
        });
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

    // First get current quantity
    inventoryModel.getUserInventoryItem(data.user_id, data.item_id, (error, currentItem) => {
        if (error) {
            console.error("Error getting current inventory item:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!currentItem) {
            return res.status(404).json({ message: "Item not found in inventory" });
        }

        // Calculate how many items are being added
        const itemsBeingAdded = data.quantity - currentItem.quantity;
        
        if (itemsBeingAdded <= 0) {
            // If reducing quantity, no XP cost
            updateInventoryQuantity(data, 0, res);
        } else {
            // Calculate XP cost (50 XP per item added)
            const xpCost = itemsBeingAdded * 50;

            // Check if user has enough XP
            userModel.selectUserById({ id: data.user_id }, (error, users) => {
                if (error) {
                    console.error("Error getting user:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (!users || users.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                const user = users[0];
                if (user.experience_points < xpCost) {
                    return res.status(400).json({ 
                        message: `Not enough experience points. Need ${xpCost} XP, but only have ${user.experience_points} XP`
                    });
                }

                // User has enough XP, proceed with update
                updateInventoryQuantity(data, xpCost, res);
            });
        }
    });
};

function updateInventoryQuantity(data, xpCost, res) {
    // First update the inventory
    inventoryModel.updateItemQuantity(data, (error, result) => {
        if (error) {
            console.error("Error updating inventory:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (xpCost > 0) {
            // If there's an XP cost, update user's experience points
            userModel.selectUserById({ id: data.user_id }, (error, users) => {
                if (error) {
                    console.error("Error getting user:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (!users || users.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                const user = users[0];
                const currentExperience = user.experience_points - xpCost;
                
                userModel.updateUserStats(data.user_id, user.skill_points, currentExperience, (error) => {
                    if (error) {
                        console.error("Error updating experience points:", error);
                        return res.status(500).json({ message: "Internal server error" });
                    }

                    res.status(200).json({
                        message: "Quantity updated successfully",
                        newQuantity: data.quantity,
                        experienceDeducted: xpCost,
                        newExperience: currentExperience
                    });
                });
            });
        } else {
            // No XP cost, just return success
            res.status(200).json({
                message: "Quantity updated successfully",
                newQuantity: data.quantity
            });
        }
    });
}

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