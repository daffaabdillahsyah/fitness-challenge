//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require("express");

//////////////////////////////////////////////////////
// CREATE ROUTER
//////////////////////////////////////////////////////
const router = express.Router();

const jwtMiddleware = require("../middlewares/jwtMiddleware");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");
const userController = require("../controllers/userController");
const playerRoutes = require("../routes/playerRoutes");
const userRoutes = require("../routes/userRoutes");
const reviewRoutes = require("../routes/reviewRoutes");
const challengeRoutes = require("../routes/challengeRoutes");
const questRoutes = require("../routes/questRoutes");
const inventoryRoutes = require("../routes/inventoryRoutes");
const inventoryController = require("../controllers/inventoryController");

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////

// Authentication Routes
router.post("/login", userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.post("/register", 
    userController.checkUsernameOrEmailExist, 
    bcryptMiddleware.hashPassword, 
    userController.register, 
    inventoryController.addInitialItemsForNewUser,
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken
);

// Route Groups
router.use("/player", playerRoutes);
router.use("/user", userRoutes);
router.use("/reviews", reviewRoutes);
router.use("/challenges", challengeRoutes);
router.use("/quests", questRoutes);
router.use("/inventory", inventoryRoutes);

//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router;
