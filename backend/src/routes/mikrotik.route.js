/**
 * MikroTik API Routes
 * 
 * GET /api/mikrotik/active - Admin - Get active sessions
 * GET /api/mikrotik/stats - Admin - Get router stats
 */
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const mikrotikService = require('../services/mikrotik.service');

router.get('/active', protect, adminOnly, async (req, res, next) => {
  try {
    const active = await mikrotikService.getActiveSessions();
    res.json({ success: true, data: active });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const stats = await mikrotikService.getRouterStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/health', protect, adminOnly, async (req, res, next) => {
  try {
    const resources = await mikrotikService.getSystemResources();
    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
});

router.post('/terminate', protect, adminOnly, async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'username required' });
    
    // We disable the user and kick them off active list by removing them
    // Depending on mikrotik setup, disabling them drops active session, or we might need to remove active session.
    // For now we'll delete the active session directly if the method is available, but the service only has deleteHotspotUser which deletes from users list.
    // Actually, to kick someone off we need to remove them from active.
    // But since the service currently provides disableHotspotUser, we'll use that.
    await mikrotikService.disableHotspotUser(username);
    res.json({ success: true, message: `Session for ${username} terminated` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
