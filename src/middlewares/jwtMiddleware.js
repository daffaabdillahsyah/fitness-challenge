//////////////////////////////////////////////////////
// REQUIRE DOTENV MODULE
//////////////////////////////////////////////////////
require("dotenv").config();

//////////////////////////////////////////////////////
// REQUIRE JWT MODULE
//////////////////////////////////////////////////////
const jwt = require("jsonwebtoken");

//////////////////////////////////////////////////////
// SET JWT CONFIGURATION
//////////////////////////////////////////////////////
const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN || "1h";
const tokenAlgorithm = process.env.JWT_ALGORITHM || "HS256";

// Ensure required env variables are loaded
if (!secretKey) {
    console.error("❌ ERROR: JWT_SECRET_KEY is not set in .env file!");
    process.exit(1); // Exit process if critical config is missing
}

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR GENERATING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.generateToken = (req, res, next) => {
    const payload = {
        userId: res.locals.userId,
        username: res.locals.username,
        timestamp: new Date()
    };

    const options = {
        algorithm: tokenAlgorithm,
        expiresIn: tokenDuration
    };

    jwt.sign(payload, secretKey, options, (err, token) => {
        if (err) {
            console.error("❌ JWT Signing Error:", err);
            return res.status(500).json({ error: "Error generating token" });
        }
        res.locals.token = token;
        next();
    });
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR SENDING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.sendToken = (req, res) => {
    res.status(200).json({
        message: res.locals.message || "Token generated successfully",
        token: res.locals.token
    });
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR VERIFYING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.error("❌ JWT Token Expired:", err.expiredAt);
                return res.status(401).json({ error: "Token has expired. Please log in again." });
            } else {
                console.error("❌ JWT Verification Error:", err);
                return res.status(401).json({ error: "Invalid token" });
            }
        }

        res.locals.userId = decoded.userId;
        res.locals.username = decoded.username;
        res.locals.tokenTimestamp = decoded.timestamp;

        next();
    });
};
