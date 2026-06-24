/**
 * M-Pesa Daraja API Service
 * Supports: STK Push (Lipa Na M-Pesa Online), Transaction Query
 */
const axios = require('axios');

const BASE_URL =
  process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

class MpesaService {
  /**
   * Get OAuth access token from Daraja
   */
  async getAccessToken() {
    const credentials = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` },
    });

    return data.access_token;
  }

  /**
   * Generate Lipa Na M-Pesa password
   * Base64(Shortcode + Passkey + Timestamp)
   */
  generatePassword() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
    const raw = `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`;
    return { password: Buffer.from(raw).toString('base64'), timestamp };
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   * @param {{ phone: string, amount: number, accountRef: string, description: string }}
   */
  async stkPush({ phone, amount, accountRef, description }) {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    // Normalize phone: 07XX → 2547XX
    const normalizedPhone = phone.startsWith('0')
      ? `254${phone.slice(1)}`
      : phone.replace('+', '');

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: normalizedPhone,
        PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
        PhoneNumber: normalizedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: accountRef,
        TransactionDesc: description || 'Payment',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (data.ResponseCode !== '0') {
      throw new Error(data.ResponseDescription || 'STK Push failed');
    }

    return {
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    };
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestId
   */
  async queryTransaction(checkoutRequestId) {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data;
  }
}

module.exports = new MpesaService();
