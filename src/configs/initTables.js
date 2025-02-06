const pool = require("../services/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const callback = (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
};

bcrypt.hash("password123", saltRounds, (error, hash) => {
  if (error) {
    console.error("Error hashing password:", error);
  } else {
    console.log("Hashed password:", hash);

    const SQLSTATEMENT = `
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS Review;
      DROP TABLE IF EXISTS UserChallenge;
      DROP TABLE IF EXISTS UserQuest;
      DROP TABLE IF EXISTS UserItem;
      DROP TABLE IF EXISTS Challenge;
      DROP TABLE IF EXISTS Quest;
      DROP TABLE IF EXISTS Item;
      DROP TABLE IF EXISTS User;

      -- Create User table
      CREATE TABLE User (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        streak INT DEFAULT 0,
        skill_points INT DEFAULT 0,
        experience_points INT DEFAULT 0,
        level INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Create Challenge table
      CREATE TABLE Challenge (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Quest table
      CREATE TABLE Quest (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        points INT DEFAULT 0,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Item table
      CREATE TABLE Item (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type ENUM('consumable', 'equipment', 'trophy') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create UserChallenge table
      CREATE TABLE UserChallenge (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        challenge_id INT NOT NULL,
        status ENUM('not_started', 'in_progress', 'completed', 'failed') DEFAULT 'not_started',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (challenge_id) REFERENCES Challenge(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_challenge (user_id, challenge_id)
      );

      -- Create UserQuest table
      CREATE TABLE UserQuest (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        quest_id INT NOT NULL,
        status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (quest_id) REFERENCES Quest(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_quest (user_id, quest_id)
      );

      -- Create UserItem table
      CREATE TABLE UserItem (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES Item(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_item (user_id, item_id)
      );

      -- Create Review table
      CREATE TABLE Review (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        challenge_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (challenge_id) REFERENCES Challenge(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_challenge (user_id, challenge_id)
      );

      -- Insert some sample items
      INSERT INTO Item (name, description, type) VALUES
        ('Energy Drink', 'Restores energy instantly', 'consumable'),
        ('Running Shoes', 'Increases movement speed', 'equipment'),
        ('Protein Shake', 'Boosts muscle recovery after workouts', 'consumable'),
        ('Yoga Mat', 'Essential for yoga and stretching exercises', 'equipment'),
        ('Resistance Band', 'Perfect for strength training anywhere', 'equipment'),
        ('Sports Water Bottle', 'Stay hydrated during workouts', 'equipment'),
        ('Fitness Tracker', 'Track your daily activities and progress', 'equipment'),
        ('Gym Gloves', 'Protect your hands during weight training', 'equipment'),
        ('Recovery Supplements', 'Help reduce muscle soreness', 'consumable'),
        ('Champion Trophy', 'Awarded for exceptional achievement', 'trophy');

      -- Insert some sample challenges
      INSERT INTO Challenge (title, description, points) VALUES
        ('10k Steps Challenge', 'Walk 10,000 steps daily for 7 days\nImage: https://images.unsplash.com/photo-1476480862126-209bfaa8edc8', 100),
        ('Marathon Training', 'Complete a full marathon training program\nImage: https://images.unsplash.com/photo-1461896836934-ffe607ba8211', 500),
        ('30 Days Yoga Journey', 'Practice yoga daily for 30 days\nImage: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 300),
        ('Strength Training Master', 'Complete 20 strength training sessions\nImage: https://images.unsplash.com/photo-1534438327276-14e5300c3a48', 400),
        ('Swimming Pro', 'Swim 20 laps daily for 15 days\nImage: https://images.unsplash.com/photo-1530549387789-4c1017266635', 350),
        ('Cycling Adventure', 'Complete a 50km cycling journey\nImage: https://images.unsplash.com/photo-1541625602330-2277a4c46182', 250);

      -- Insert some sample quests
      INSERT INTO Quest (title, description, points, difficulty) VALUES
        ('Beginner Workout', 'Complete a basic workout routine\nImage: https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 50, 'easy'),
        ('Marathon Prep', 'Prepare for an upcoming marathon\nImage: https://images.unsplash.com/photo-1461896836934-ffe607ba8211', 200, 'hard'),
        ('Morning Yoga', 'Start your day with a peaceful yoga session\nImage: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 75, 'easy'),
        ('HIIT Training', 'Complete a high-intensity interval training session\nImage: https://images.unsplash.com/photo-1517838277536-f5f99be501cd', 150, 'medium'),
        ('Meditation Session', 'Practice mindfulness for 30 minutes\nImage: https://images.unsplash.com/photo-1506126613408-eca07ce68773', 50, 'easy'),
        ('Mountain Hiking', 'Complete a challenging mountain trail\nImage: https://images.unsplash.com/photo-1551632811-561732d1e306', 180, 'hard');
    `;

    pool.query(SQLSTATEMENT, callback);
  }
});



