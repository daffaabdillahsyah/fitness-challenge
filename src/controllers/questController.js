//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const questModel = require("../models/questModel");
const userModel = require("../models/userModel");

//////////////////////////////////////////////////////
// GET ALL QUESTS
//////////////////////////////////////////////////////
module.exports.getAllQuests = (req, res) => {
    questModel.getAllQuests((error, results) => {
        if (error) {
            console.error("Error getting quests:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// GET USER QUESTS
//////////////////////////////////////////////////////
module.exports.getUserQuests = (req, res) => {
    questModel.getUserQuests(res.locals.userId, (error, results) => {
        if (error) {
            console.error("Error getting user quests:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// GET ACTIVE QUESTS
//////////////////////////////////////////////////////
module.exports.getActiveQuests = (req, res) => {
    const userId = res.locals.userId;
    questModel.getActiveQuests(userId, (error, results) => {
        if (error) {
            console.error("Error getting active quests:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// START QUEST
//////////////////////////////////////////////////////
module.exports.startQuest = (req, res) => {
    const data = {
        user_id: res.locals.userId,
        quest_id: req.params.id
    };

    questModel.startQuest(data, (error, results) => {
        if (error) {
            console.error("Error starting quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({ message: "Successfully started the quest" });
    });
};

//////////////////////////////////////////////////////
// COMPLETE QUEST
//////////////////////////////////////////////////////
module.exports.completeQuest = (req, res) => {
    const userId = res.locals.userId;
    const questId = req.params.id;

    // First get quest details for points
    questModel.getQuestById(questId, (error, quest) => {
        if (error) {
            console.error("Error getting quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        // Validate quest points
        if (typeof quest.points !== 'number' || isNaN(quest.points)) {
            console.error("Invalid quest points:", quest);
            return res.status(500).json({ message: "Invalid quest points" });
        }

        // Update quest status to completed
        questModel.completeQuest(userId, questId, (error) => {
            if (error) {
                console.error("Error completing quest:", error);
                return res.status(500).json({ message: "Internal server error" });
            }

            // Get current user stats
            userModel.selectUserById({ id: userId }, (error, user) => {
                if (error) {
                    console.error("Error getting user:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (!user || user.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                // Calculate new points and experience
                const currentSkillPoints = parseInt(user[0].skill_points) || 0;
                const currentExperience = parseInt(user[0].experience_points) || 0;
                const questPoints = parseInt(quest.points) || 0;
                
                const newSkillPoints = currentSkillPoints + questPoints;
                const additionalXP = Math.floor(questPoints / 100) * 50; // 50 XP for every 100 skill points
                const newExperience = currentExperience + additionalXP;

                // Update user stats
                userModel.updateUserStats(userId, newSkillPoints, newExperience, (error) => {
                    if (error) {
                        console.error("Error updating user stats:", error);
                        return res.status(500).json({ message: "Internal server error" });
                    }

                    res.status(200).json({
                        message: "Quest completed successfully",
                        skillPointsGained: questPoints,
                        experienceGained: additionalXP,
                        newSkillPoints: newSkillPoints,
                        newExperience: newExperience
                    });
                });
            });
        });
    });
};