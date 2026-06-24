const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const totalRevenueAggr = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });
    
    const activeSessions = await prisma.hotspotSession.count({
      where: { status: 'ACTIVE' }
    });
    
    const customers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });
    
    const unpaid = await prisma.invoice.count({
      where: { status: 'PENDING' }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentPayments = await prisma.payment.findMany({
      where: { 
        status: 'SUCCESS',
        createdAt: { gte: sevenDaysAgo }
      },
      select: { amount: true, createdAt: true }
    });

    const dailyRevenue = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const name = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyRevenue[name] = 0;
    }

    recentPayments.forEach(p => {
      const name = new Date(p.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyRevenue[name] !== undefined) {
        dailyRevenue[name] += p.amount;
      }
    });

    const chartData = Object.keys(dailyRevenue).map(key => ({
      name: key,
      revenue: dailyRevenue[key]
    }));

    res.json({
      success: true,
      data: {
        revenue: totalRevenueAggr._sum.amount || 0,
        activeSessions,
        customers,
        unpaid,
        chartData
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
