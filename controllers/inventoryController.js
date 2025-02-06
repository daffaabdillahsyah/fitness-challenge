const inventoryModel = require('../models/inventoryModel');
const userModel = require('../models/userModel');

module.exports.updateQuantity = (req, res) => {
    const userId = req.user.id;
    const itemId = req.params.id;
    const newQuantity = req.body.quantity;

    if (!userId || !itemId || !newQuantity) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // First get the current quantity
    inventoryModel.getInventoryItem(userId, itemId, (error, currentItem) => {
        if (error) {
            console.error("Error getting current inventory item:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!currentItem) {
            return res.status(404).json({ message: "Item not found in inventory" });
        }

        // Calculate how many items are being added
        const itemsBeingAdded = newQuantity - currentItem.quantity;
        
        if (itemsBeingAdded <= 0) {
            // If reducing quantity, no XP cost
            updateInventoryQuantity(userId, itemId, newQuantity, 0, res);
        } else {
            // Calculate XP cost (50 XP per item added)
            const xpCost = itemsBeingAdded * 50;

            // Check if user has enough XP
            userModel.getUserById(userId, (error, user) => {
                if (error) {
                    console.error("Error getting user:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                if (user.experience_points < xpCost) {
                    return res.status(400).json({ 
                        message: `Not enough experience points. Need ${xpCost} XP, but only have ${user.experience_points} XP`
                    });
                }

                // User has enough XP, proceed with update
                updateInventoryQuantity(userId, itemId, newQuantity, xpCost, res);
            });
        }
    });
};

function updateInventoryQuantity(userId, itemId, newQuantity, xpCost, res) {
    // First update the inventory
    inventoryModel.updateQuantity(userId, itemId, newQuantity, (error, result) => {
        if (error) {
            console.error("Error updating inventory:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!result) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (xpCost > 0) {
            // If there's an XP cost, update user's experience points
            userModel.deductExperiencePoints(userId, xpCost, (error, updatedUser) => {
                if (error) {
                    console.error("Error updating experience points:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                res.status(200).json({
                    message: "Quantity updated successfully",
                    newQuantity: newQuantity,
                    experienceDeducted: xpCost,
                    newExperience: updatedUser.experience_points
                });
            });
        } else {
            // No XP cost, just return success
            res.status(200).json({
                message: "Quantity updated successfully",
                newQuantity: newQuantity
            });
        }
    });
} 