//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const pool = require("../services/db");

//////////////////////////////////////////////////////
// GET ALL CHALLENGES
//////////////////////////////////////////////////////
module.exports.getAllChallenges = (callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM Challenge
        ORDER BY created_at DESC;
    `;
    pool.query(SQLSTATEMENT, callback);
}

//////////////////////////////////////////////////////
// CREATE CHALLENGE
//////////////////////////////////////////////////////
module.exports.createChallenge = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Challenge (title, description, imageUrl, points)
        VALUES (?, ?, ?, ?);
    `;
    const VALUES = [data.title, data.description, data.imageUrl, data.points];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// UPDATE CHALLENGE
//////////////////////////////////////////////////////
module.exports.updateChallenge = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Challenge
        SET title = ?, description = ?, imageUrl = ?, points = ?
        WHERE id = ?;
    `;
    const VALUES = [data.title, data.description, data.imageUrl, data.points, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// DELETE CHALLENGE
//////////////////////////////////////////////////////
module.exports.deleteChallenge = (challengeId, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM Challenge
        WHERE id = ?;
    `;
    pool.query(SQLSTATEMENT, [challengeId], callback);
}

//////////////////////////////////////////////////////
// JOIN CHALLENGE
//////////////////////////////////////////////////////
module.exports.joinChallenge = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserChallenge (user_id, challenge_id, status)
        VALUES (?, ?, 'in_progress')
        ON DUPLICATE KEY UPDATE status = 'in_progress';
    `;
    const VALUES = [data.user_id, data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// GET USER CHALLENGES
//////////////////////////////////////////////////////
module.exports.getUserChallenges = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT Challenge.*, UserChallenge.status, UserChallenge.created_at as joined_at
        FROM Challenge
        INNER JOIN UserChallenge ON Challenge.id = UserChallenge.challenge_id
        WHERE UserChallenge.user_id = ?
        ORDER BY UserChallenge.created_at DESC;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
}

//////////////////////////////////////////////////////
// GET CHALLENGE BY ID
//////////////////////////////////////////////////////
module.exports.getChallengeById = (challengeId, callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Challenge
        WHERE id = ?;
    `;
    pool.query(SQLSTATEMENT, [challengeId], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results[0]);
    });
}; 