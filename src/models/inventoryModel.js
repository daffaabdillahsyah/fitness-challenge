//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const pool = require("../services/db");

//////////////////////////////////////////////////////
// GET USER INVENTORY
//////////////////////////////////////////////////////
module.exports.getUserInventory = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT Item.*, UserItem.quantity
        FROM Item
        INNER JOIN UserItem ON Item.id = UserItem.item_id
        WHERE UserItem.user_id = ?
        ORDER BY Item.name;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
}

//////////////////////////////////////////////////////
// ADD ITEM TO INVENTORY
//////////////////////////////////////////////////////
module.exports.addItemToInventory = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserItem (user_id, item_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
    `;
    const VALUES = [data.user_id, data.item_id, data.quantity];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// UPDATE ITEM QUANTITY
//////////////////////////////////////////////////////
module.exports.updateItemQuantity = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserItem
        SET quantity = ?
        WHERE user_id = ? AND item_id = ?;
    `;
    const VALUES = [data.quantity, data.user_id, data.item_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// REMOVE ITEM FROM INVENTORY
//////////////////////////////////////////////////////
module.exports.removeItemFromInventory = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM UserItem
        WHERE user_id = ? AND item_id = ?;
    `;
    const VALUES = [data.user_id, data.item_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// ADD INITIAL ITEMS FOR NEW USER
//////////////////////////////////////////////////////
module.exports.addInitialItems = (userId, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserItem (user_id, item_id, quantity)
        VALUES 
        (?, 1, 3),  -- 3 Energy Drinks
        (?, 2, 1),  -- 1 Running Shoes
        (?, 3, 2),  -- 2 Protein Shakes
        (?, 4, 1),  -- 1 Yoga Mat
        (?, 5, 2),  -- 2 Resistance Bands
        (?, 6, 1),  -- 1 Sports Water Bottle
        (?, 7, 1),  -- 1 Fitness Tracker
        (?, 8, 1),  -- 1 Gym Gloves
        (?, 9, 2);  -- 2 Recovery Supplements
    `;
    const VALUES = [
        userId, userId, userId, userId, userId,
        userId, userId, userId, userId
    ];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// GET USER INVENTORY ITEM
//////////////////////////////////////////////////////
module.exports.getUserInventoryItem = (userId, itemId, callback) => {
    const SQLSTATEMENT = `
        SELECT Item.*, UserItem.quantity
        FROM Item
        INNER JOIN UserItem ON Item.id = UserItem.item_id
        WHERE UserItem.user_id = ? AND UserItem.item_id = ?;
    `;
    pool.query(SQLSTATEMENT, [userId, itemId], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results[0]);
    });
}; 