//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const pool = require("../services/db");

//////////////////////////////////////////////////////
// CREATE REVIEW
//////////////////////////////////////////////////////
module.exports.createReview = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Review (user_id, challenge_id, rating, comment)
        VALUES (?, ?, ?, ?);
    `;
    const VALUES = [data.user_id, data.challenge_id, data.rating, data.comment];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// GET ALL REVIEWS
//////////////////////////////////////////////////////
module.exports.getAllReviews = (callback) => {
    const SQLSTATEMENT = `
        SELECT Review.*, User.username, Challenge.title as challenge_title
        FROM Review
        INNER JOIN User ON Review.user_id = User.id
        INNER JOIN Challenge ON Review.challenge_id = Challenge.id
        ORDER BY Review.created_at DESC;
    `;
    pool.query(SQLSTATEMENT, callback);
}

//////////////////////////////////////////////////////
// GET USER'S REVIEWS
//////////////////////////////////////////////////////
module.exports.getUserReviews = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT Review.*, Challenge.title as challenge_title
        FROM Review
        INNER JOIN Challenge ON Review.challenge_id = Challenge.id
        WHERE Review.user_id = ?
        ORDER BY Review.created_at DESC;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
}

//////////////////////////////////////////////////////
// UPDATE REVIEW
//////////////////////////////////////////////////////
module.exports.updateReview = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Review 
        SET rating = ?, comment = ?
        WHERE id = ? AND user_id = ?;
    `;
    const VALUES = [data.rating, data.comment, data.review_id, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// DELETE REVIEW
//////////////////////////////////////////////////////
module.exports.deleteReview = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM Review
        WHERE id = ? AND user_id = ?;
    `;
    const VALUES = [data.review_id, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// CHECK IF USER HAS ALREADY REVIEWED
//////////////////////////////////////////////////////
module.exports.checkExistingReview = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT id FROM Review
        WHERE user_id = ? AND challenge_id = ?;
    `;
    const VALUES = [data.user_id, data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
} 