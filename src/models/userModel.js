//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const pool = require("../services/db");

module.exports.selectAllUser = (callback) => {
    const SQLSTATEMENT = `
        SELECT id, username, email, streak, skill_points, experience_points, level, created_at
        FROM User;
    `;

    pool.query(SQLSTATEMENT, callback);
}


module.exports.selectUserById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT id, username, email, level, skill_points, experience_points, streak,
               created_at, updated_at
        FROM User
        WHERE id = ?;
    `;

    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// SELECT ALL PLAYERS BY USER
//////////////////////////////////////////////////////
module.exports.selectAllPlayerByUserId = (data, callback) => {
    const SQLSTATEMENT =  `
        SELECT Playeruserrel.user_id, Playeruserrel.player_id, User.username, Player.name as character_name, Player.level as character_level, Player.created_on as char_created_on, User.created_on as user_created_on
        FROM Playeruserrel
        INNER JOIN Player ON Playeruserrel.player_id = Player.id
        INNER JOIN User ON Playeruserrel.user_id = User.id
        WHERE Playeruserrel.user_id = ?;
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// SELECT USER BY USERNAME
//////////////////////////////////////////////////////
module.exports.selectUserByUsername = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM User
        WHERE username = ?;
    `;

    const VALUES = [data.username];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// SELECT USER BY USERNAME OR EMAIL
//////////////////////////////////////////////////////
module.exports.selectUserByUsernameOrEmail = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM User
        WHERE username = ? OR email = ?;
    `;

    const VALUES = [data.username, data.email];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.insertNewUser = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO User (username, email, password) 
    VALUES (?, ?, ?);
    `
    const VALUES = [data.username, data.email, data.password];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// UPDATE USER STATS
//////////////////////////////////////////////////////
module.exports.updateUserStats = (userId, skillPoints, experiencePoints, callback) => {
    const SQLSTATEMENT = `
        UPDATE User
        SET skill_points = ?,
            experience_points = ?,
            level = FLOOR(experience_points / 100) + 1
        WHERE id = ?;
    `;
    pool.query(SQLSTATEMENT, [skillPoints, experiencePoints, userId], callback);
};




