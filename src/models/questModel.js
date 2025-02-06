//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const pool = require("../services/db");

//////////////////////////////////////////////////////
// GET ALL QUESTS
//////////////////////////////////////////////////////
module.exports.getAllQuests = (callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM Quest
        ORDER BY created_at DESC;
    `;
    pool.query(SQLSTATEMENT, callback);
}

//////////////////////////////////////////////////////
// GET USER QUESTS
//////////////////////////////////////////////////////
module.exports.getUserQuests = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT Quest.*, UserQuest.status, UserQuest.created_at as started_at
        FROM Quest
        INNER JOIN UserQuest ON Quest.id = UserQuest.quest_id
        WHERE UserQuest.user_id = ?
        ORDER BY UserQuest.created_at DESC;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
}

//////////////////////////////////////////////////////
// START QUEST
//////////////////////////////////////////////////////
module.exports.startQuest = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserQuest (user_id, quest_id, status)
        VALUES (?, ?, 'in_progress')
        ON DUPLICATE KEY UPDATE status = 'in_progress';
    `;
    const VALUES = [data.user_id, data.quest_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// GET ACTIVE QUESTS
//////////////////////////////////////////////////////
module.exports.getActiveQuests = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT Quest.*, UserQuest.status, UserQuest.created_at as started_at,
               UserQuest.completed_at, Quest.difficulty as type
        FROM Quest
        INNER JOIN UserQuest ON Quest.id = UserQuest.quest_id
        WHERE UserQuest.user_id = ? 
        AND UserQuest.status IN ('in_progress', 'completed')
        ORDER BY 
            CASE 
                WHEN UserQuest.status = 'in_progress' THEN 1
                WHEN UserQuest.status = 'completed' THEN 2
            END,
            UserQuest.created_at DESC;
    `;
    pool.query(SQLSTATEMENT, [userId], callback);
};

//////////////////////////////////////////////////////
// GET QUEST BY ID
//////////////////////////////////////////////////////
module.exports.getQuestById = (questId, callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Quest
        WHERE id = ?;
    `;
    pool.query(SQLSTATEMENT, [questId], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results[0]);
    });
};

//////////////////////////////////////////////////////
// COMPLETE QUEST
//////////////////////////////////////////////////////
module.exports.completeQuest = (userId, questId, callback) => {
    const SQLSTATEMENT = `
        UPDATE UserQuest
        SET status = 'completed',
            completed_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND quest_id = ?;
    `;
    pool.query(SQLSTATEMENT, [userId, questId], callback);
}; 