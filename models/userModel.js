module.exports.deductExperiencePoints = (userId, amount, callback) => {
    const query = `
        UPDATE User 
        SET experience_points = experience_points - ?
        WHERE id = ? AND experience_points >= ?
        RETURNING *;
    `;
    
    db.get(query, [amount, userId, amount], (error, user) => {
        if (error) {
            console.error("Error deducting experience points:", error);
            return callback(error);
        }
        callback(null, user);
    });
}; 