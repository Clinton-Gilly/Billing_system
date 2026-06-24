require('dotenv').config();
const smsService = require('../src/services/sms.service');
const emailService = require('../src/services/email.service');

async function runTest() {
  console.log('--- Starting Notifications Integration Test ---');
  try {
    const testPhone = '+254700000000'; // Dummy phone
    const testEmail = 'test@example.com'; // Dummy email
    const expiresAt = new Date(Date.now() + 24 * 3600000);

    console.log(`1. Testing SMS to ${testPhone}...`);
    try {
      await smsService.send({ 
        to: testPhone, 
        message: 'Test message from Xuremi Net!' 
      });
      console.log('   SMS test finished.');
    } catch (err) {
      console.error('   SMS test failed:', err.message);
    }

    console.log(`\n2. Testing Receipt Email to ${testEmail}...`);
    try {
      await emailService.sendReceiptEmail(testEmail, {
        username: 'hs_test_123',
        password: 'PASSWORD',
        packageName: 'Daily Unlimited',
        expiresAt: expiresAt
      });
      console.log('   Receipt Email test finished.');
    } catch (err) {
      console.error('   Receipt Email test failed:', err.message);
    }

    console.log('\n--- Notifications Test Completed ---');
  } catch (error) {
    console.error('\n!!! Test Failed !!!');
    console.error(error);
  }
}

runTest();
