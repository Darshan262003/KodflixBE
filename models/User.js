const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Check if database is configured
const hasDbConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME && process.env.DB_PORT;

// Helper function to check database availability
const checkDbAvailability = () => {
  if (!hasDbConfig) {
    throw new Error('Database not configured - please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and DB_PORT environment variables');
  }
};

class User {
  // Create users table if it doesn't exist
  static async createTable() {
    checkDbAvailability();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        uid INT AUTO_INCREMENT PRIMARY KEY,
        uname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phn VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.execute(createTableQuery);
      console.log('Users table is ready');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    checkDbAvailability();
    
    const { uname, email, phn, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (uname, email, phn, password, role) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [uname, email, phn, hashedPassword, role]);
      return { uid: result.insertId, uname, email, phn, role };
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    checkDbAvailability();
    
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const [rows] = await db.execute(query, [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by uid
  static async findById(uid) {
    checkDbAvailability();
    
    const query = 'SELECT * FROM users WHERE uid = ?';
    
    try {
      const [rows] = await db.execute(query, [uid]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Validate password
  static async validatePassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = User;