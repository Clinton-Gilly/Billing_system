/**
 * Global error handler middleware
 * Must be the LAST app.use() call in index.js
 */
exports.errorHandler = (err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Prisma constraint errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({
      message: `A record with that ${field} already exists`,
    });
  }

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Create a custom API error with a status code
 */
exports.ApiError = class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
};
