const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// Public routes
router.post('/register', authController.registerRules, validate, authController.register);
router.post('/login', authController.loginRules, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected route
router.get('/me', protect, authController.getMe);

module.exports = router;
