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

/**
 * Middleware to check resource ownership
 * @param {Function} getResourceId - Function to extract resource ID from request
 * @param {Function} getResourceOwner - Async function to get resource and check ownership
 * @returns {Function} Middleware function
 */
const requireOwnership = (getResourceId, getResourceOwner) => {
  return async (req, res, next) => {
    try {
      const resourceId = getResourceId(req);
      const resource = await getResourceOwner(resourceId);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Check if user is the owner or an admin
      const isOwner = resource.postedBy 
        ? resource.postedBy.toString() === req.user._id.toString()
        : resource.user 
          ? resource.user.toString() === req.user._id.toString()
          : false;

      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to access this resource' });
      }

      // Attach resource to request for later use
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error checking ownership' });
    }
  };
};

module.exports = { auth, optionalAuth, requireRole, requireAdmin, requireOwnership };
