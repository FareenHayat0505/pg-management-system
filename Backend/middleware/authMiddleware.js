const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - checks if user is logged in
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Get user
      const user = await User.findById(decoded.id)
        .select('-password');

      // Check if user exists or deactivated
      if (!user || user.isActive === false) {
        return res.status(401).json({
          message: "Account deactivated. Please contact admin."
        });
      }

      req.user = user;

      next();

    } catch (error) {
      return res.status(401).json({
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, no token'
    });
  }
};
// Admin only route protection
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
}; 


module.exports = { protect, adminOnly };