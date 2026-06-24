const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect } = require('../middleware/auth.middleware');
const mpesaService = require('../services/mpesa.service');
const mikrotikService = require('../services/mikrotik.service');
const { ApiError } = require('../middleware/error.middleware');
const bcrypt = require('bcryptjs');

// GET /api/payments — admin sees all, customer sees own
router.get('/', protect, async (req, res, next) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const payments = await prisma.payment.findMany({
      where,
      include: { user: { select: { name: true, phone: true } }, invoice: true, package: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (err) { next(err); }
});

// POST /api/payments/hotspot-stk — initiate STK Push from Captive Portal (PUBLIC)
router.post('/hotspot-stk', async (req, res, next) => {
  try {
    const { phone, packageId, macAddress, ipAddress } = req.body;
    if (!phone || !packageId) throw new ApiError('Phone and packageId are required', 400);

    // Get package details
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new ApiError('Package not found', 404);

    // Find or create user based on phone
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phone, 10);
      user = await prisma.user.create({
        data: {
          name: `Guest ${phone.slice(-4)}`,
          email: `${phone}@hotspot.local`,
          phone,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      });
    }

    // Initiate STK Push
    const { checkoutRequestId } = await mpesaService.stkPush({
      phone,
      amount: pkg.price,
      accountRef: phone,
      description: `Hotspot: ${pkg.name}`,
    });

    // Create pending payment record with metadata
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        amount: pkg.price,
        phoneNumber: phone,
        checkoutRequestId,
        macAddress,
        ipAddress,
        status: 'PENDING',
      },
    });

    res.json({
      message: 'STK Push sent — please check your phone',
      checkoutRequestId,
      paymentId: payment.id,
    });
  } catch (err) { next(err); }
});

// POST /api/payments/mpesa/stk — initiate STK Push for Invoice (PROTECTED)
router.post('/mpesa/stk', protect, async (req, res, next) => {
  try {
    const { amount, phone, invoiceId } = req.body;
    if (!amount || !phone) throw new ApiError('Amount and phone are required', 400);

    const { checkoutRequestId } = await mpesaService.stkPush({
      phone,
      amount: Number(amount),
      accountRef: invoiceId || req.user.id,
      description: 'Hotspot Billing Payment',
    });

    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        invoiceId: invoiceId || null,
        amount: Number(amount),
        phoneNumber: phone,
        checkoutRequestId,
        status: 'PENDING',
      },
    });

    res.json({ message: 'STK Push sent', checkoutRequestId, paymentId: payment.id });
  } catch (err) { next(err); }
});

// POST /api/payments/mpesa/callback — M-Pesa webhook (PUBLIC)
router.post('/mpesa/callback', async (req, res, next) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) return res.json({ ResultCode: 0, ResultDesc: 'OK' });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callbackData;

    if (ResultCode === 0) {
      // Payment successful
      const items = CallbackMetadata?.Item || [];
      const get = (name) => items.find((i) => i.Name === name)?.Value;

      // Update payment to SUCCESS
      await prisma.payment.updateMany({
        where: { checkoutRequestId: CheckoutRequestID },
        data: {
          status: 'SUCCESS',
          mpesaRef: get('MpesaReceiptNumber'),
        },
      });

      // Fetch the updated payment to provision hotspot or update invoice
      const payment = await prisma.payment.findFirst({
        where: { checkoutRequestId: CheckoutRequestID },
        include: { package: true },
      });

      if (payment) {
        // If this payment was for an invoice
        if (payment.invoiceId) {
          await prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: { status: 'PAID' },
          });
        }

        // If this payment was for a hotspot package
        if (payment.packageId && payment.package) {
          // Generate MikroTik hotspot credentials
          const hotspotUsername = payment.phoneNumber;
          const hotspotPassword = Math.random().toString(36).slice(-8);
          
          // Calculate expiration
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + payment.package.duration);

          // Create session in DB
          await prisma.hotspotSession.create({
            data: {
              userId: payment.userId,
              packageId: payment.packageId,
              username: hotspotUsername,
              password: hotspotPassword,
              expiresAt,
              status: 'ACTIVE'
            }
          });

          // Provision on MikroTik router
          await mikrotikService.createUser({
            username: hotspotUsername,
            password: hotspotPassword,
            profile: payment.package.mikrotikProfile,
            comment: `mac=${payment.macAddress || ''} ip=${payment.ipAddress || ''}`
          });
        }
      }
    } else {
      // Payment failed
      await prisma.payment.updateMany({
        where: { checkoutRequestId: CheckoutRequestID },
        data: { status: 'FAILED', failureReason: callbackData.ResultDesc },
      });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) { next(err); }
});

// GET /api/payments/:id/status — public endpoint for captive portal polling
router.get('/:id/status', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { sessions: { orderBy: { createdAt: 'desc' }, take: 1 } } }
      }
    });
    if (!payment) throw new ApiError('Payment not found', 404);

    let sessionDetails = null;
    if (payment.status === 'SUCCESS' && payment.user?.sessions?.length > 0) {
      // Send back the latest session credentials so the frontend can auto-login
      const session = payment.user.sessions[0];
      sessionDetails = {
        username: session.username,
        password: session.password
      };
    }

    res.json({ status: payment.status, sessionDetails });
  } catch (err) { next(err); }
});

// GET /api/payments/:id — protected full details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) throw new ApiError('Payment not found', 404);
    if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
      throw new ApiError('Forbidden', 403);
    }
    res.json({ payment });
  } catch (err) { next(err); }
});

module.exports = router;
