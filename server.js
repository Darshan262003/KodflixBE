// Load environment variables first
require('dotenv').config();

console.log('Environment variables loaded at server startup:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const app = require('./app');
const User = require('./models/User');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Check if database is configured
    const dbConfig = db.connection ? db.connection.config : null;
    const hasDbConfig = dbConfig && dbConfig.host && dbConfig.user && dbConfig.password && dbConfig.database;
    
    if (hasDbConfig) {
      // Create users table
      await User.createTable();
      console.log('Database initialized successfully');
    } else {
      console.warn('⚠️  Database not configured - skipping table creation');
      console.warn('⚠️  Add database environment variables to enable full functionality');
    }
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!hasDbConfig) {
        console.log('⚠️  Database operations will fail until environment variables are set');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();