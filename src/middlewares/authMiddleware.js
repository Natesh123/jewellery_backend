const jwt = require('jsonwebtoken');
const  pool  = require('../config/db.config');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers['authorization'] 
  ) {
   
    try {
    
     token = req.headers['authorization'].split(' ')[1]; 
      // console.log("Token from query: ", token);
      

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [user] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [decoded.id]);

      

      if (!user[0]) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user[0];
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `You do not have permission to perform this action. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};



module.exports = { protect, admin , restrictTo };
