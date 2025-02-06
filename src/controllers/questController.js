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
// CREATE QUEST
//////////////////////////////////////////////////////
module.exports.createQuest = (req, res) => {
    if (!req.body.title || !req.body.points || !req.body.difficulty) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const data = {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        points: req.body.points,
        difficulty: req.body.difficulty
    };

    questModel.createQuest(data, (error, results) => {
        if (error) {
            console.error("Error creating quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(201).json({
            message: "Quest created successfully",
            questId: results.insertId
        });
    });
};

//////////////////////////////////////////////////////
// UPDATE QUEST
//////////////////////////////////////////////////////
module.exports.updateQuest = (req, res) => {
    if (!req.params.id || !req.body.title || !req.body.points || !req.body.difficulty) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const data = {
        id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        points: req.body.points,
        difficulty: req.body.difficulty
    };

    questModel.updateQuest(data, (error, results) => {
        if (error) {
            console.error("Error updating quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Quest not found" });
        }

        res.status(200).json({ message: "Quest updated successfully" });
    });
};

//////////////////////////////////////////////////////
// DELETE QUEST
//////////////////////////////////////////////////////
module.exports.deleteQuest = (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ message: "Quest ID is required" });
    }

    questModel.deleteQuest(req.params.id, (error, results) => {
        if (error) {
            console.error("Error deleting quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Quest not found" });
        }

        res.status(200).json({ message: "Quest deleted successfully" });
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
    questModel.getActiveQuests(res.locals.userId, (error, results) => {
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

    questModel.getQuestById(questId, (error, quest) => {
        if (error) {
            console.error("Error getting quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        questModel.completeQuest(userId, questId, (error) => {
            if (error) {
                console.error("Error completing quest:", error);
                return res.status(500).json({ message: "Internal server error" });
            }

            userModel.selectUserById({ id: userId }, (error, user) => {
                if (error) {
                    console.error("Error getting user:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (!user || user.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                const currentSkillPoints = parseInt(user[0].skill_points) || 0;
                const currentExperience = parseInt(user[0].experience_points) || 0;
                const questPoints = parseInt(quest.points) || 0;
                
                const newSkillPoints = currentSkillPoints + questPoints;
                const additionalXP = Math.floor(questPoints / 100) * 50;
                const newExperience = currentExperience + additionalXP;

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

//////////////////////////////////////////////////////
// GET QUEST BY ID
//////////////////////////////////////////////////////
module.exports.getQuestById = (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ message: "Quest ID is required" });
    }

    questModel.getQuestById(req.params.id, (error, quest) => {
        if (error) {
            console.error("Error getting quest:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        res.status(200).json(quest);
    });
};