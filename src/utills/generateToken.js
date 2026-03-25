const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Generate Email Verification Token
const generateEmailVerificationToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Verify Email Token
const verifyEmailToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate OTP (6-digit)
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};


module.exports = {    
  
  generateToken,
  generateEmailVerificationToken,
  verifyEmailToken,
  generateOtp,
};

