//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const model = require("../models/userModel");

module.exports.readAllUser = (req, res, next) => {
    const callback = (error, results, fields) => {
        if(error) {
            console.error("Error readAllUser", error);
            res.status(500).json({
                message: "Internal server error."
            });
        }
        else res.status(200).json(results);
    }

    model.selectAllUser(callback);
}

module.exports.readUserById = (req, res, next) => {
    if(req.params.id == undefined) {
        res.status(400).json({
            message: "Missing required infromation."
        });
    }

    const data = {
        id: req.params.id
    }
    
    const callback = (error, results, fields) => {
        if(error) {
            res.status(500).json({
                message: "Internal server error."
            });
        } else {
            if(results.length == 0) {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else {
                res.status(200).json(results[0]);
            }
        }
    }

    model.selectUserById(data, callback);
}

//////////////////////////////////////////////////////
// GET ALL PLAYERS BY USER
//////////////////////////////////////////////////////
module.exports.getAllPlayerByUserId = (req, res, next) => {

    const data = {
        user_id: res.locals.userId
    }

    const callback = (error, results, fields) => {
        if(error) {
            res.status(500).send("Error getAllPlayerByUserId");
        }
        else if(results.length == 0) {
            res.status(404).json({
                message: "Player not found"
            });
        }
        else {
            res.status(200).send(results);
        }
    }
    model.selectAllPlayerByUserId(data, callback);
}

//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) => {
    if(req.body.username == undefined || req.body.password == undefined) {
        return res.status(400).json({
            message: "Missing required information."
        });
    }

    const data = {
        username: req.body.username,
        password: req.body.password
    }

    const callback = (error, results, fields) => {
        if(error) {
            return res.status(500).json({
                message: "Internal server error."
            });
        }
        else if(results.length == 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        else {
            res.locals.hash = results[0].password;
            res.locals.userId = results[0].id;
            next();
        }
    }

    model.selectUserByUsername(data, callback);
}

//////////////////////////////////////////////////////
// CONTROLLER FOR REGISTER
//////////////////////////////////////////////////////
module.exports.register = (req, res, next) => {
    const data = {
        username: res.locals.username,
        email: res.locals.email,
        password: res.locals.hash
    }

    const callback = (error, results, fields) => {
        if(error) {
            return res.status(500).json({
                message: "Internal server error."
            });
        }
        else {
            res.locals.message = `User ${data.username} created successfully.`
            res.locals.userId = results.insertId;
            next();
        }
    }

    model.insertNewUser(data, callback);
}

//////////////////////////////////////////////////////
// MIDDLEWARE FOR CHECK IF USERNAME OR EMAIL EXISTS
//////////////////////////////////////////////////////
module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    if(req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) {
        return res.status(400).json({
            message: "Missing required information."
        });
    }
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    const callback = (error, results, fields) => {
        if(error) {
            return res.status(500).json({
                message: "Internal server error."
            });
        } 
        else if(results.length != 0) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }
        else {
            res.locals.username = data.username;
            res.locals.email = data.email;
            res.locals.password = data.password;
            next();
        }
    }

    model.selectUserByUsernameOrEmail(data, callback);
}

//////////////////////////////////////////////////////
// MIDDLWARE FOR CHECK IF PLAYER BELONGS TO USER
//////////////////////////////////////////////////////

module.exports.getProfile = async (req, res) => {
    try {
        const userId = res.locals.userId; // Ensure this is set correctly

        if (!userId) {
            console.error("Error: No user ID found in token");
            return res.status(401).json({ message: "Unauthorized: No user ID found in token" });
        }

        console.log(`Fetching profile for user ID: ${userId}`);

        model.selectUserById({ id: userId }, (error, results) => { // Fixed parameter name
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ message: "Database error", error });
            }

            if (!results || results.length === 0) {
                console.error(`Error: User ID ${userId} not found`);
                return res.status(404).json({ message: "User not found" });
            }

            console.log("User profile fetched successfully:", results[0]);
            res.status(200).json(results[0]);
        });

    } catch (err) {
        console.error("Unexpected Error:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
