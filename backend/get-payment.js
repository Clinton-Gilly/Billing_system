const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.payment.findUnique({ where: { id: 'cmqr2qd200000ukj2bloffpbl' } }); 
  console.log('checkoutRequestId:', p.checkoutRequestId); 
} 
main().catch(e => console.error(e)).finally(() => process.exit(0));
