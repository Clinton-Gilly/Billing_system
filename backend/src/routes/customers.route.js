/**
 * Customers API Routes
 * 
 * GET /api/customers - Admin - Get all customers
 * GET /api/customers/:id - Admin or Own User - Get customer details
 */
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', protect, adminOnly, (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/:id', protect, (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.json({ success: true, data: {} });
});

module.exports = router;
