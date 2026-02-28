const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Create users table if it doesn't exist
  static async createTable() {
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