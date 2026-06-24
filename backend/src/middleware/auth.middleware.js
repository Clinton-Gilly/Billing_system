const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma.client');

/**
 * Protect routes — verifies Bearer token in Authorization header
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info from token (no DB hit for performance)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

/**
 * Restrict to ADMIN role only
 */
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

/**
 * Restrict to CUSTOMER role only
 */
exports.customerOnly = (req, res, next) => {
  if (req.user?.role !== 'CUSTOMER') {
    return res.status(403).json({ message: 'Forbidden: Customers only' });
  }
  next();
};
