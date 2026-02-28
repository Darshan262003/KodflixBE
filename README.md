# Kodflix Backend API

A Node.js + Express backend application with user authentication using JWT and MySQL database.

## Features

- User registration with input validation
- User login with JWT token generation
- Secure password hashing with bcrypt
- HTTP-only cookies for token storage
- MySQL database integration with SSL
- Compatible with frontend at [kodflix-fe.vercel.app](https://kodflix-fe.vercel.app)

## Endpoints

### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "uname": "string",
  "email": "string",
  "phn": "string",
  "password": "string",
  "role": "string" (optional, defaults to "user")
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": 1,
    "uname": "username",
    "email": "email@example.com",
    "phn": "1234567890",
    "role": "user"
  }
}
```

### POST /api/auth/login
Login user and receive JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "uid": 1,
    "uname": "username",
    "email": "email@example.com",
    "role": "user"
  }
}
```
JWT token is sent as HTTP-only cookie.

### POST /api/auth/logout
Logout user and clear token cookie

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  uid INT AUTO_INCREMENT PRIMARY KEY,
  uname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phn VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file with your database credentials:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   DB_PORT=your_database_port
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Test the endpoints:**
   ```bash
   node test-endpoints.js
   ```

## Validation Rules

**Registration:**
- All fields (uname, email, phn, password) are required
- Email must be valid format
- Phone number must be 10-15 digits
- Password must be at least 6 characters

**Login:**
- Email and password are required
- Email must be valid format

## Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens use HS256 algorithm with 24-hour expiration
- Tokens are stored in HTTP-only cookies with strict same-site policy
- SSL/TLS encryption for database connections
- CORS configured for secure cross-origin requests

## Technologies Used

- Node.js
- Express.js
- MySQL2
- bcryptjs
- jsonwebtoken
- dotenv
- cors