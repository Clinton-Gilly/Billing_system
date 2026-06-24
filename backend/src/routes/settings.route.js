const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// GET /api/settings/router - Get current router config
router.get('/router', protect, adminOnly, async (req, res, next) => {
  try {
    const router = await prisma.mikroTikRouter.findFirst({ where: { isActive: true } });
    if (router) {
      // Redact password
      router.password = '********';
    }
    res.json({ success: true, data: router || null });
  } catch (error) {
    next(error);
  }
});

// POST /api/settings/router - Update router config
router.post('/router', protect, adminOnly, async (req, res, next) => {
  try {
    const { host, port, username, password, name } = req.body;
    let router = await prisma.mikroTikRouter.findFirst({ where: { isActive: true } });
    
    if (router) {
      const dataToUpdate = { host, port: Number(port), username, name: name || router.name };
      // Only update password if it's not the masked value
      if (password && password !== '********') {
        dataToUpdate.password = password;
      }
      router = await prisma.mikroTikRouter.update({
        where: { id: router.id },
        data: dataToUpdate
      });
    } else {
      if (!password || password === '********') {
        return res.status(400).json({ success: false, message: 'Password is required for new router' });
      }
      router = await prisma.mikroTikRouter.create({
        data: {
          name: name || 'Main Router',
          host,
          port: Number(port) || 8728,
          username,
          password,
          isActive: true
        }
      });
    }

    res.json({ success: true, message: 'Router settings saved' });
  } catch (error) {
    next(error);
  }
});

// POST /api/settings/roles - Update user role
router.post('/roles', protect, adminOnly, async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role || !['ADMIN', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role data' });
    }

    // Prevent self-demotion
    if (req.user.id === userId && role !== 'ADMIN') {
      return res.status(400).json({ success: false, message: 'You cannot demote yourself' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.json({ success: true, message: `Role updated to ${role} for ${updated.name}` });
  } catch (error) {
    next(error);
  }
});

// GET /api/settings/roles - Fetch users for role management
router.get('/roles', protect, adminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
