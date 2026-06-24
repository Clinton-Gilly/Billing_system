const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/error.middleware');

// GET /api/packages — public (customers can view)
router.get('/', async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    res.json({ packages });
  } catch (err) { next(err); }
});

// GET /api/packages/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!pkg) throw new ApiError('Package not found', 404);
    res.json({ package: pkg });
  } catch (err) { next(err); }
});

// POST /api/packages — admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, duration, speed, dataLimit, mikrotikProfile } = req.body;
    const pkg = await prisma.package.create({
      data: { name, description, price, duration, speed, dataLimit, mikrotikProfile },
    });
    res.status(201).json({ message: 'Package created', package: pkg });
  } catch (err) { next(err); }
});

// PUT /api/packages/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const pkg = await prisma.package.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ message: 'Package updated', package: pkg });
  } catch (err) { next(err); }
});

// DELETE /api/packages/:id — admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await prisma.package.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: 'Package deactivated' });
  } catch (err) { next(err); }
});

module.exports = router;
