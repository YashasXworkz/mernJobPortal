/**
 * Centralized error handling utility
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 */
const handleError = (error, res) => {
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
  console.error('Unhandled error:', error);
  return res.status(500).json({ 
    error: 'Server error. Please try again.',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};

module.exports = { handleError };
