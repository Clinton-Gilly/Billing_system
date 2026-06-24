/**
 * Payments API Routes
 * 
 * GET /api/payments - Protected - Get all payments
 * POST /api/payments/hotspot-stk - Public - Initiate STK Push
 * POST /api/payments/mpesa/stk - Protected - Initiate STK Push
 * POST /api/payments/mpesa/callback - Public - M-Pesa webhook
 * GET /api/payments/:id/status - Public - Poll payment status
 * GET /api/payments/:id - Protected - Get payment details
 */
module.exports = require('./payment.routes');
