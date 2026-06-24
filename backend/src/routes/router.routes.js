const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/error.middleware');

// GET /api/routers — admin only
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const routers = await prisma.mikrotikRouter.findMany({
      orderBy: { createdAt: 'asc' },
    });
    // Mask passwords
    const safe = routers.map(({ password: _, ...r }) => r);
    res.json({ routers: safe });
  } catch (err) { next(err); }
});

// POST /api/routers — admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, host, port, username, password, location } = req.body;
    const router_ = await prisma.mikrotikRouter.create({
      data: { name, host, port: Number(port) || 8728, username, password, location },
    });
    const { password: _, ...safe } = router_;
    res.status(201).json({ message: 'Router added', router: safe });
  } catch (err) { next(err); }
});

// DELETE /api/routers/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await prisma.mikrotikRouter.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: 'Router deactivated' });
  } catch (err) { next(err); }
});

module.exports = router;
