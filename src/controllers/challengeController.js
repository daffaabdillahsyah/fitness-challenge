//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const challengeModel = require("../models/challengeModel");

//////////////////////////////////////////////////////
// GET ALL CHALLENGES
//////////////////////////////////////////////////////
module.exports.getAllChallenges = (req, res) => {
    challengeModel.getAllChallenges((error, results) => {
        if (error) {
            console.error("Error getting challenges:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

//////////////////////////////////////////////////////
// JOIN CHALLENGE
//////////////////////////////////////////////////////
module.exports.joinChallenge = (req, res) => {
    const data = {
        user_id: res.locals.userId,
        challenge_id: req.params.id
    };

    // First check if user has already joined this challenge
    challengeModel.getUserChallenges(data.user_id, (error, results) => {
        if (error) {
            console.error("Error checking user challenges:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        // Check if user has already joined this challenge
        const alreadyJoined = results.some(challenge => 
            challenge.id === parseInt(data.challenge_id)
        );

        if (alreadyJoined) {
            return res.status(409).json({ message: "Already joined this challenge" });
        }

        // Get challenge details for points
        challengeModel.getChallengeById(data.challenge_id, (error, challenge) => {
            if (error) {
                console.error("Error getting challenge:", error);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (!challenge) {
                return res.status(404).json({ message: "Challenge not found" });
            }

            // Join the challenge
            challengeModel.joinChallenge(data, (error, results) => {
                if (error) {
                    console.error("Error joining challenge:", error);
                    return res.status(500).json({ message: "Internal server error" });
                }

                // Update user's skill points and experience
                const userModel = require("../models/userModel");
                userModel.selectUserById({ id: data.user_id }, (error, user) => {
                    if (error) {
                        console.error("Error getting user:", error);
                        return res.status(500).json({ message: "Internal server error" });
                    }

                    if (!user || user.length === 0) {
                        return res.status(404).json({ message: "User not found" });
                    }

                    const currentSkillPoints = parseInt(user[0].skill_points) || 0;
                    const currentExperience = parseInt(user[0].experience_points) || 0;
                    const challengePoints = parseInt(challenge.points) || 0;
                    
                    // Calculate new points and experience
                    const newSkillPoints = currentSkillPoints + challengePoints;
                    const additionalXP = Math.floor(challengePoints / 100) * 50; // 50 XP for every 100 skill points
                    const newExperience = currentExperience + additionalXP;

                    userModel.updateUserStats(data.user_id, newSkillPoints, newExperience, (error) => {
                        if (error) {
                            console.error("Error updating user stats:", error);
                            return res.status(500).json({ message: "Internal server error" });
                        }

                        res.status(200).json({
                            message: "Successfully joined the challenge",
                            pointsGained: challengePoints,
                            experienceGained: additionalXP,
                            newSkillPoints: newSkillPoints,
                            newExperience: newExperience
                        });
                    });
                });
            });
        });
    });
};

//////////////////////////////////////////////////////
// GET USER CHALLENGES
//////////////////////////////////////////////////////
module.exports.getUserChallenges = (req, res) => {
    challengeModel.getUserChallenges(res.locals.userId, (error, results) => {
        if (error) {
            console.error("Error getting user challenges:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
}; 