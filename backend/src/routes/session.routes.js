const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/error.middleware');

// GET /api/sessions — admin sees all, customer sees own
router.get('/', protect, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const where = isAdmin ? {} : { userId: req.user.id };

    const sessions = await prisma.hotspotSession.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        package: true,
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });
    res.json({ sessions });
  } catch (err) { next(err); }
});

// GET /api/sessions/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const session = await prisma.hotspotSession.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } }, package: true },
    });
    if (!session) throw new ApiError('Session not found', 404);
    if (req.user.role !== 'ADMIN' && session.userId !== req.user.id) {
      throw new ApiError('Forbidden', 403);
    }
    res.json({ session });
  } catch (err) { next(err); }
});

// POST /api/sessions — admin creates session for customer
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { userId, packageId } = req.body;
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new ApiError('Package not found', 404);

    const expiresAt = new Date(Date.now() + pkg.duration * 60 * 60 * 1000);
    const username = `hs_${userId.slice(-6)}_${Date.now()}`;
    const password = Math.random().toString(36).slice(-8);

    const session = await prisma.hotspotSession.create({
      data: { userId, packageId, username, password, expiresAt, status: 'ACTIVE' },
      include: { package: true },
    });

    // TODO: Create user on MikroTik (Phase 4)
    // await mikrotikService.createUser({ username, password, profile: pkg.mikrotikProfile, expiresAt });

    res.status(201).json({ message: 'Session created', session });
  } catch (err) { next(err); }
});

// PATCH /api/sessions/:id/suspend — admin suspends session
router.patch('/:id/suspend', protect, adminOnly, async (req, res, next) => {
  try {
    const session = await prisma.hotspotSession.update({
      where: { id: req.params.id },
      data: { status: 'SUSPENDED' },
    });
    // TODO: Remove user from MikroTik
    res.json({ message: 'Session suspended', session });
  } catch (err) { next(err); }
});

module.exports = router;
