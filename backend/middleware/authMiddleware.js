const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // attach user info to request
    next(); // pass control to next middleware/controller
  } catch(err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};
