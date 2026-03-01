const mysql = require('mysql2');
require('dotenv').config();

// Parse database configuration
let dbConfig = {};

// Check if DB_HOST is a connection string
if (process.env.DB_HOST && process.env.DB_HOST.startsWith('mysql://')) {
  // Parse connection string format
  try {
    const url = new URL(process.env.DB_HOST);
    dbConfig = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remove leading slash
      ssl: url.searchParams.get('ssl-mode') === 'REQUIRED' ? { rejectUnauthorized: false } : false
    };
    console.log('Using connection string format for database configuration');
  } catch (error) {
    console.error('Error parsing database connection string:', error);
    process.exit(1);
  }
} else {
  // Use individual environment variables
  dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL_MODE === 'REQUIRED' ? { rejectUnauthorized: false } : false
  };
}

console.log('Database configuration:');
console.log('- Host:', dbConfig.host || 'UNDEFINED');
console.log('- Port:', dbConfig.port || 'UNDEFINED');
console.log('- User:', dbConfig.user || 'UNDEFINED');
console.log('- Database:', dbConfig.database || 'UNDEFINED');
console.log('- SSL:', dbConfig.ssl ? 'ENABLED' : 'DISABLED');

// Check if we have all required database configuration
const hasDbConfig = dbConfig.host && dbConfig.user && dbConfig.password && dbConfig.database;

if (!hasDbConfig) {
  console.warn('⚠️  Database configuration missing - database operations will fail');
  console.warn('⚠️  Please set either:');
  console.warn('  1. DB_HOST as a connection string (mysql://user:pass@host:port/db?ssl-mode=REQUIRED)');
  console.warn('  2. Individual variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
}

// Create connection pool
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: dbConfig.ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

module.exports = promisePool;