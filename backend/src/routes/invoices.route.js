/**
 * Invoices API Routes
 * 
 * GET /api/invoices - Own User - Get user invoices
 * POST /api/invoices - Protected - Create invoice and trigger STK Push
 * GET /api/invoices/:id - Protected - Get specific invoice details
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.get('/', protect, (req, res) => {
  // logic to filter by req.user.id
  res.json({ success: true, data: [] });
});

router.post('/', protect, [
  body('amount').isNumeric().withMessage('Amount is required')
], validate, (req, res) => {
  res.json({ success: true, data: { status: 'PENDING' } });
});

router.get('/:id', protect, (req, res) => {
  res.json({ success: true, data: {} });
});

module.exports = router;
