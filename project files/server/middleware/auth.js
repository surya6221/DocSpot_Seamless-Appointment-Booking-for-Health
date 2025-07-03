const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model to check roles

exports.auth = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract the token (remove "Bearer ")
  const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  // Verify token
  try {
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user payload to the request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

exports.isAdmin = async (req, res, next) => {
  // Assuming req.user is already populated by the 'auth' middleware
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admins only: Access denied' });
  }
  next();
};
