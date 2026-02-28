// Test script to verify the endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

// Test registration
async function testRegister() {
  try {
    console.log('Testing registration...');
    const response = await axios.post(`${BASE_URL}/register`, {
      uname: 'testuser',
      email: 'test@example.com',
      phn: '1234567890',
      password: 'password123',
      role: 'user'
    });
    
    console.log('Registration Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
  }
}

// Test login
async function testLogin() {
  try {
    console.log('\nTesting login...');
    const response = await axios.post(`${BASE_URL}/login`, {
      email: 'test@example.com',
      password: 'password123'
    }, {
      withCredentials: true // Important for cookies
    });
    
    console.log('Login Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
  }
}

// Test duplicate registration
async function testDuplicateRegister() {
  try {
    console.log('\nTesting duplicate registration...');
    const response = await axios.post(`${BASE_URL}/register`, {
      uname: 'testuser2',
      email: 'test@example.com', // Same email
      phn: '1234567891',
      password: 'password123',
      role: 'user'
    });
    
    console.log('Duplicate Registration Response:', response.data);
  } catch (error) {
    console.error('Duplicate Registration Error:', error.response?.data || error.message);
  }
}

// Test invalid login
async function testInvalidLogin() {
  try {
    console.log('\nTesting invalid login...');
    const response = await axios.post(`${BASE_URL}/login`, {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    console.log('Invalid Login Response:', response.data);
  } catch (error) {
    console.error('Invalid Login Error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test registration
  await testRegister();
  
  // Test duplicate registration
  await testDuplicateRegister();
  
  // Test login
  await testLogin();
  
  // Test invalid login
  await testInvalidLogin();
  
  console.log('\nAll tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testRegister,
  testLogin,
  testDuplicateRegister,
  testInvalidLogin
};