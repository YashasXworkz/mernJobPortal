const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Factory function to create authentication middleware
 * @param {boolean} required - Whether authentication is required
 * @returns {Function} Middleware function
 */
const createAuthMiddleware = (required = true) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        if (required) {
          return res.status(401).json({ error: 'No token, authorization denied' });
        }
        req.user = null;
        req.token = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        if (required) {
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = null;
        req.token = null;
        return next();
      }

      req.token = token;
      req.user = user;
      next();
    } catch (error) {
      if (required) {
        return res.status(401).json({ error: 'Token is not valid' });
      }
      req.user = null;
      req.token = null;
      next();
    }
  };
};

const auth = createAuthMiddleware(true);
const optionalAuth = createAuthMiddleware(false);

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

const requireAdmin = requireRole('admin');

module.exports = { auth, optionalAuth, requireRole, requireAdmin };
