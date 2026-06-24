/**
 * Packages API Routes
 * 
 * GET /api/packages - Public - Get all packages
 * POST /api/packages - Admin - Create a new package
 * PUT /api/packages/:id - Admin - Update a package
 * DELETE /api/packages/:id - Admin - Delete a package
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', protect, adminOnly, [
  body('name').notEmpty().withMessage('Name is required')
], validate, (req, res) => {
  res.json({ success: true, data: {} });
});

router.put('/:id', protect, adminOnly, [
  body('name').notEmpty().withMessage('Name is required')
], validate, (req, res) => {
  res.json({ success: true, data: {} });
});

router.delete('/:id', protect, adminOnly, (req, res) => {
  res.json({ success: true, data: {} });
});

module.exports = router;
