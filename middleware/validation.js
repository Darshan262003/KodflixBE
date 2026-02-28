const validateRegister = (req, res, next) => {
  const { uname, email, phn, password } = req.body;
  
  // Check required fields
  if (!uname || !email || !phn || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: uname, email, phn, password'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Validate phone number (basic validation)
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phn.replace(/[-\s()]/g, ''))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format'
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin
};