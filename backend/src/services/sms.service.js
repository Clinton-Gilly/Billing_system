const AfricasTalking = require('africastalking');

const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME || 'sandbox'
};

const at = AfricasTalking(credentials);

class SmsService {
  async send({ to, message }) {
    try {
      const options = {
        to: [to],
        message: message,
        from: 'XUREMI'
      };
      
      const result = await at.SMS.send(options);
      console.log('📱 SMS sent:', JSON.stringify(result.SMSMessageData?.Recipients));
      return result;
    } catch (err) {
      console.error('❌ SMS send error:', err.message);
      throw err;
    }
  }
}

module.exports = new SmsService();
