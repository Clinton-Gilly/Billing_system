/**
 * Auth API Routes
 * 
 * POST /api/auth/register - Public - Register a new user
 * POST /api/auth/login - Public - Login user
 * POST /api/auth/refresh - Public - Refresh token
 * POST /api/auth/logout - Public - Logout user
 * GET /api/auth/me - Protected - Get current user profile
 */
module.exports = require('./auth.routes');
