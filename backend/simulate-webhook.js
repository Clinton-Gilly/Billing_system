const prisma = require('./src/models/prisma.client');

async function main() {
  const p = await prisma.payment.findUnique({ where: { id: 'cmqr2qd200000ukj2bloffpbl' } });
  console.log('checkoutRequestId:', p.checkoutRequestId);
  
  // Simulate Daraja Webhook locally using fetch
  const payload = {
    Body: {
      stkCallback: {
        MerchantRequestID: "29115-34620561-1",
        CheckoutRequestID: p.checkoutRequestId,
        ResultCode: 0,
        ResultDesc: "The service request is processed successfully.",
        CallbackMetadata: {
          Item: [
            { Name: "Amount", Value: 1 },
            { Name: "MpesaReceiptNumber", Value: "NLJ7RT61SV" },
            { Name: "PhoneNumber", Value: p.phoneNumber }
          ]
        }
      }
    }
  };

  const response = await fetch('http://localhost:5000/api/payments/mpesa/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const text = await response.text();
  console.log('Webhook Response:', response.status, text);
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
