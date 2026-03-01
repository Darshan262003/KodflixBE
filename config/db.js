const mysql = require('mysql2');
require('dotenv').config();

console.log('Database configuration:');
console.log('- Host:', process.env.DB_HOST || 'UNDEFINED');
console.log('- Port:', process.env.DB_PORT || 'UNDEFINED');
console.log('- User:', process.env.DB_USER || 'UNDEFINED');
console.log('- Database:', process.env.DB_NAME || 'UNDEFINED');

// Check if we have all required database environment variables
const hasDbConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME && process.env.DB_PORT;

if (!hasDbConfig) {
  console.warn('⚠️  Database environment variables missing - database operations will fail');
  console.warn('⚠️  This is normal during initial deployment - add env vars in Vercel settings');
}

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false  // Required for Aiven Cloud SSL
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

module.exports = promisePool;