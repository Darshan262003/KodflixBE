const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Simple helper function to check database availability
const checkDbAvailability = () => {
  // We'll just rely on the db module to throw errors if not configured
  // Rather than trying to check its configuration which causes circular dependencies
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
      
      // Check if we need to add missing columns
      await this.checkAndFixSchema();
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    checkDbAvailability();
    
    const { uname, email, phn, phone, mobile, password, role = 'user' } = userData;
    
    // Use the first available phone field
    const phoneNumber = phn || phone || mobile || '';
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check what columns exist in the table
    try {
      const [columns] = await db.execute("SHOW COLUMNS FROM users");
      console.log('Available columns in users table:', columns.map(col => col.Field));
      
      // Check if 'phn' column exists
      const hasPhnColumn = columns.some(col => col.Field === 'phn');
      const hasPhoneColumn = columns.some(col => col.Field === 'phone');
      const hasMobileColumn = columns.some(col => col.Field === 'mobile');
      
      let phoneColumn = 'phn'; // default
      if (hasPhnColumn) {
        phoneColumn = 'phn';
      } else if (hasPhoneColumn) {
        phoneColumn = 'phone';
      } else if (hasMobileColumn) {
        phoneColumn = 'mobile';
      } else {
        // If no phone column exists, we might need to alter the table
        console.log('No phone column found, using default value');
        phoneColumn = 'phn'; // will use default in query
      }
      
      const query = `
        INSERT INTO users (uname, email, ${phoneColumn}, password, role) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      console.log(`Using column '${phoneColumn}' for phone number`);
      
      const [result] = await db.execute(query, [uname, email, phoneNumber, hashedPassword, role]);
      return { uid: result.insertId, uname, email, phone: phoneNumber, role };
    } catch (error) {
      console.error('Error during user creation:', error);
      // If SHOW COLUMNS fails, try with default phn column
      const query = `
        INSERT INTO users (uname, email, phn, password, role) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [uname, email, phoneNumber, hashedPassword, role]);
      return { uid: result.insertId, uname, email, phone: phoneNumber, role };
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

  // Check and fix table schema
  static async checkAndFixSchema() {
    try {
      const [columns] = await db.execute("SHOW COLUMNS FROM users");
      const columnNames = columns.map(col => col.Field);
      
      console.log('Current table columns:', columnNames);
      
      // Check if phn column exists
      if (!columnNames.includes('phn')) {
        console.log('Adding missing phn column...');
        await db.execute("ALTER TABLE users ADD COLUMN phn VARCHAR(20) NOT NULL DEFAULT ''");
        console.log('phn column added successfully');
      }
      
      // Check if we have alternative phone columns and need to migrate data
      if (columnNames.includes('phone') && !columnNames.includes('phn')) {
        console.log('Migrating phone data to phn column...');
        await db.execute("UPDATE users SET phn = phone WHERE phn = ''");
      } else if (columnNames.includes('mobile') && !columnNames.includes('phn')) {
        console.log('Migrating mobile data to phn column...');
        await db.execute("UPDATE users SET phn = mobile WHERE phn = ''");
      }
      
    } catch (error) {
      console.error('Error checking/fixing schema:', error);
    }
  }
  
  // Validate password
  static async validatePassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = User;