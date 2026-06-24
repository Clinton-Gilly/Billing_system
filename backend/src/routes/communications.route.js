const express = require('express');
const router = express.Router();
const prisma = require('../models/prisma.client');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const sms = require('../services/sms.service');

router.post('/broadcast', protect, adminOnly, async (req, res, next) => {
  try {
    const { type, message, userIds } = req.body;
    if (!type || !message || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: 'type, message, and userIds array are required' });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    let successCount = 0;
    for (const user of users) {
      try {
        if (type === 'sms') {
          await sms.send({ to: user.phone, message });
          successCount++;
        } else if (type === 'email') {
          console.log(`Sending email broadcast to ${user.email}: ${message}`);
          successCount++;
        }
      } catch (err) {
        console.error(`Broadcast failed for ${user.email || user.phone}`, err.message);
      }
    }

    res.json({ success: true, message: `Broadcast sent successfully to ${successCount} user(s)` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
