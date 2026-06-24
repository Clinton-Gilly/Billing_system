const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/error.middleware');

// GET /api/invoices — admin sees all, customer sees own
router.get('/', protect, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const where = isAdmin ? {} : { userId: req.user.id };

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ invoices });
  } catch (err) { next(err); }
});

// GET /api/invoices/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } }, payments: true },
    });
    if (!invoice) throw new ApiError('Invoice not found', 404);
    if (req.user.role !== 'ADMIN' && invoice.userId !== req.user.id) {
      throw new ApiError('Forbidden', 403);
    }
    res.json({ invoice });
  } catch (err) { next(err); }
});

// POST /api/invoices — admin creates invoice
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { userId, amount, dueDate, notes } = req.body;
    const invoice = await prisma.invoice.create({
      data: { userId, amount: Number(amount), dueDate: new Date(dueDate), notes },
    });
    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) { next(err); }
});

// PATCH /api/invoices/:id — admin updates status
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ message: 'Invoice updated', invoice });
  } catch (err) { next(err); }
});

module.exports = router;
