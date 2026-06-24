/**
 * Sessions API Routes
 * 
 * GET /api/sessions - Own User - Get user sessions
 * GET /api/sessions/active - Admin - Get active sessions from MikroTik
 * DELETE /api/sessions/:id - Admin - Suspend a session
 */
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const mikrotikService = require('../services/mikrotik.service');
const provisionService = require('../services/provision.service');

router.get('/', protect, (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/active', protect, adminOnly, async (req, res, next) => {
  try {
    const active = await mikrotikService.getActiveSessions();
    res.json({ success: true, data: active });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const updated = await provisionService.suspendSession(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/manual', protect, adminOnly, async (req, res, next) => {
  try {
    const { userId, packageId } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ success: false, message: 'userId and packageId are required' });
    }
    const session = await provisionService.provisionManual(userId, packageId);
    res.json({ success: true, data: session, message: 'Session manually provisioned successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
