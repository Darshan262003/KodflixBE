const mysql = require('mysql2');
require('dotenv').config();

// Debug environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('DB_SSL_MODE:', process.env.DB_SSL_MODE || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('=====================================');

// Parse database configuration
let dbConfig = {};

// Check if DB_HOST is a connection string
if (process.env.DB_HOST && process.env.DB_HOST.startsWith('mysql://')) {
  // Parse connection string format with better URL parsing
  try {
    const url = new URL(process.env.DB_HOST);
    
    // Extract user and password manually for better compatibility
    let user = url.username;
    let password = url.password;
    
    // Fallback method for parsing user/pass from auth if URL parsing fails
    if ((!user || !password) && url.auth) {
      const [authUser, authPassword] = url.auth.split(':');
      user = user || authUser;
      password = password || authPassword;
    }
    
    // Manual parsing as fallback
    if (!user || !password) {
      const authMatch = process.env.DB_HOST.match(/mysql:\/\/(.*?):(.*?)@/);
      if (authMatch) {
        user = user || authMatch[1];
        password = password || authMatch[2];
      }
    }
    
    dbConfig = {
      host: url.hostname,
      port: url.port || 3306,
      user: user,
      password: password,
      database: url.pathname.substring(1), // Remove leading slash
      ssl: url.searchParams.get('ssl-mode') === 'REQUIRED' ? { rejectUnauthorized: false } : false
    };
    console.log('Using connection string format for database configuration');
    console.log('Parsed user:', user ? '✓' : '✗');
    console.log('Parsed password:', password ? '✓' : '✗');
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

// Debug the connection string parsing
if (process.env.DB_HOST && process.env.DB_HOST.startsWith('mysql://')) {
  console.log('Connection string debug:');
  console.log('- Raw DB_HOST:', process.env.DB_HOST);
  try {
    const url = new URL(process.env.DB_HOST);
    console.log('- URL username:', url.username || 'EMPTY');
    console.log('- URL password:', url.password ? 'SET' : 'EMPTY');
    console.log('- URL auth:', url.auth || 'NONE');
    console.log('- URL hostname:', url.hostname);
    console.log('- URL port:', url.port);
    console.log('- URL pathname:', url.pathname);
  } catch (e) {
    console.log('- URL parsing error:', e.message);
  }
}

// Check if we have all required database configuration
const hasDbConfig = dbConfig.host && dbConfig.user && dbConfig.password && dbConfig.database;

if (!hasDbConfig) {
  console.warn('⚠️  Database configuration missing - database operations will fail');
  console.warn('⚠️  Missing components:');
  if (!dbConfig.host) console.warn('  - Host is missing');
  if (!dbConfig.user) console.warn('  - User is missing');
  if (!dbConfig.password) console.warn('  - Password is missing');
  if (!dbConfig.database) console.warn('  - Database name is missing');
  console.warn('⚠️  Please set either:');
  console.warn('  1. DB_HOST as a connection string (mysql://user:pass@host:port/db?ssl-mode=REQUIRED)');
  console.warn('  2. Individual variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
} else {
  console.log('✅ Database configuration is complete');
}

// Show final database configuration
console.log('=== FINAL DATABASE CONFIG ===');
console.log('Host:', dbConfig.host || 'UNDEFINED');
console.log('Port:', dbConfig.port || 'UNDEFINED');
console.log('User:', dbConfig.user || 'UNDEFINED');
console.log('Database:', dbConfig.database || 'UNDEFINED');
console.log('SSL:', dbConfig.ssl ? 'ENABLED' : 'DISABLED');
console.log('===============================');

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