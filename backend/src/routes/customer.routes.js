const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/error.middleware');

// GET /api/customers — admin only
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }
      : { role: 'CUSTOMER' };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, createdAt: true,
          _count: { select: { sessions: true, payments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ customers, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/customers/:id — admin only
router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: { include: { package: true }, orderBy: { startTime: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!customer) throw new ApiError('Customer not found', 404);
    const { password: _, ...safe } = customer;
    res.json({ customer: safe });
  } catch (err) { next(err); }
});

// PATCH /api/customers/:id — admin only
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const customer = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json({ message: 'Customer updated', customer });
  } catch (err) { next(err); }
});

module.exports = router;
