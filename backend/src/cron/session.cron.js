const cron = require('node-cron');
const prisma = require('../models/prisma.client');
const mikrotik = require('../services/mikrotik.service');
const sms = require('../services/sms.service');
const email = require('../services/email.service');

function startCronJobs() {
  // Job 1: Every 15 minutes — Expiry processing
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const expiredSessions = await prisma.hotspotSession.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lte: now }
        },
        include: { user: true }
      });

      let count = 0;
      for (const session of expiredSessions) {
        try {
          await mikrotik.deleteHotspotUser(session.username);
          
          await prisma.hotspotSession.update({
            where: { id: session.id },
            data: { status: 'EXPIRED' }
          });

          await sms.send({
            to: session.user.phone,
            message: `Your Xuremi Net session has expired. Please renew your package.`
          });
          
          count++;
        } catch (err) {
          console.error(`Failed to process expired session ${session.id}:`, err.message);
        }
      }
      console.log('[CRON] Expiry job ran at', now, '| processed:', count);
    } catch (error) {
      console.error('[CRON] Error in expiry job:', error.message);
    }
  });

  // Job 2: Every hour — Expiry warning (expires within 60 min)
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in60Min = new Date(now.getTime() + 60 * 60 * 1000);

      const expiringSessions = await prisma.hotspotSession.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
            lte: in60Min
          }
        },
        include: { user: true }
      });

      let count = 0;
      for (const session of expiringSessions) {
        try {
          await sms.send({
            to: session.user.phone,
            message: `Warning: Your Xuremi Net session expires in less than an hour at ${session.expiresAt.toLocaleTimeString()}.`
          });

          await email.sendExpiryWarningEmail(session.user.email, {
            username: session.user.name,
            expiresAt: session.expiresAt
          });

          count++;
        } catch (err) {
          console.error(`Failed to send warning for session ${session.id}:`, err.message);
        }
      }
      console.log('[CRON] Expiry warning job ran at', now, '| warned:', count);
    } catch (error) {
      console.error('[CRON] Error in expiry warning job:', error.message);
    }
  });

  // Job 3: Daily at midnight — Overdue invoices
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'PENDING',
          dueDate: { lte: now }
        }
      });

      let count = 0;
      for (const inv of overdueInvoices) {
        try {
          await prisma.invoice.update({
            where: { id: inv.id },
            data: { status: 'OVERDUE' }
          });
          count++;
        } catch (err) {
          console.error(`Failed to update invoice ${inv.id}:`, err.message);
        }
      }
      console.log('[CRON] Overdue invoice job ran at', now, '| updated:', count);
    } catch (error) {
      console.error('[CRON] Error in overdue invoice job:', error.message);
    }
  });
}

module.exports = { startCronJobs };
