const prisma = require('../models/prisma.client');
const mikrotik = require('./mikrotik.service');
const sms = require('./sms.service');
const email = require('./email.service');

async function provisionHotspotUser(invoiceId) {
  // Fetch Invoice with user and successful package
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { 
      user: true, 
      payments: { 
        include: { package: true } 
      } 
    }
  });

  if (!invoice) throw new Error('Invoice not found');

  // Extract Package from the first successful payment record
  // Assuming 'COMPLETED' or 'SUCCESS' marks a successful payment
  const payment = invoice.payments.find(p => ['COMPLETED', 'SUCCESS'].includes(p.status));
  if (!payment) throw new Error('No successful payment found for this invoice');
  const pkg = payment.package;

  // Generate username
  const username = 'hs_' + invoice.userId.slice(0, 6) + '_' + Date.now().toString(36);

  // Generate password
  const password = Math.random().toString(36).slice(-6).toUpperCase();

  // Calculate expiresAt
  const expiresAt = new Date(Date.now() + pkg.duration * 3600000);

  // Call MikroTik
  try {
    await mikrotik.createHotspotUser({
      username,
      password,
      profile: pkg.mikrotikProfile,
      uptimeLimit: pkg.duration + 'h'
    });
  } catch (error) {
    console.error('MikroTik provisioning failed:', error);
    throw error;
  }

  // On MikroTik success, save session
  const session = await prisma.hotspotSession.create({
    data: {
      userId: invoice.userId,
      packageId: pkg.id,
      username,
      password,
      expiresAt,
      status: 'ACTIVE'
    }
  });

  // Send SMS
  try {
    await sms.send({ 
      to: invoice.user.phone, 
      message: 'Internet Active! User: ' + username + ' Pass: ' + password + ' Expires: ' + expiresAt.toLocaleString() 
    });
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
  }

  // Send Email
  try {
    await email.sendReceiptEmail(invoice.user.email, { 
      username, 
      password, 
      packageName: pkg.name, 
      expiresAt 
    });
  } catch (error) {
    console.error('Failed to send Email:', error.message);
  }

  return session;
}

async function suspendSession(sessionId) {
  const session = await prisma.hotspotSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) throw new Error('Session not found');

  await mikrotik.disableHotspotUser(session.username);

  const updatedSession = await prisma.hotspotSession.update({
    where: { id: sessionId },
    data: { status: 'SUSPENDED' }
  });

  return updatedSession;
}

async function provisionManual(userId, packageId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });

  if (!user || !pkg) throw new Error('User or Package not found');

  const username = 'hs_' + user.id.slice(0, 6) + '_' + Date.now().toString(36);
  const password = Math.random().toString(36).slice(-6).toUpperCase();
  const expiresAt = new Date(Date.now() + pkg.duration * 3600000);

  try {
    await mikrotik.createHotspotUser({
      username,
      password,
      profile: pkg.mikrotikProfile,
      uptimeLimit: pkg.duration + 'h'
    });
  } catch (error) {
    console.error('MikroTik manual provisioning failed:', error);
    throw error;
  }

  const session = await prisma.hotspotSession.create({
    data: {
      userId: user.id,
      packageId: pkg.id,
      username,
      password,
      expiresAt,
      status: 'ACTIVE'
    }
  });

  try {
    await sms.send({ 
      to: user.phone, 
      message: 'Internet Active! User: ' + username + ' Pass: ' + password + ' Expires: ' + expiresAt.toLocaleString() 
    });
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
  }

  try {
    await email.sendReceiptEmail(user.email, { 
      username, 
      password, 
      packageName: pkg.name, 
      expiresAt 
    });
  } catch (error) {
    console.error('Failed to send Email:', error.message);
  }

  return session;
}

module.exports = {
  provisionHotspotUser,
  suspendSession,
  provisionManual
};
