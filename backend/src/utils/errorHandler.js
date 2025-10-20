/**
 * Centralized logging utility (internal use only)
 * @private
 * @param {string} level - Log level (error, warn, info)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...meta
  };

  // In production, you would send this to a logging service
  // For now, we'll use structured console logging
  if (level === 'error') {
    console.error(JSON.stringify(logEntry, null, 2));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry, null, 2));
  } else {
    console.log(JSON.stringify(logEntry, null, 2));
  }
};

/**
 * Centralized error handling utility
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {string} context - Context where error occurred (optional)
 */
const handleError = (error, res, context = 'Unknown') => {
  // Log the error with context
  log('error', `Error in ${context}`, {
    errorName: error.name,
    errorMessage: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ 
      error: `${field} already exists` 
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid ID format' 
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Database connection error
  if (error.name === 'MongoNetworkError') {
    return res.status(500).json({
      error: 'Database connection error. Please ensure MongoDB is running.'
    });
  }

  // Generic error
  return res.status(500).json({ 
    error: error.message || 'Server error. Please try again.',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};

module.exports = { handleError };
