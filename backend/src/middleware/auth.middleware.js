const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Protect routes - Only allow logged in users
exports.protect = async (req, res, next) => {
  try {
    let token = null;

    // We expect the token to be sent in the header as "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ success: false, message: 'Please login to access this route' });
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user who owns this token
    const user = await User.findById(decodedToken.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
    }

    // Save the user object in the request so the next functions can use it
    req.user = user;
    
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Grant access to specific roles only
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the current user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} trying to access restricted route`);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    
    next();
  };
};
