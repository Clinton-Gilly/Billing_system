const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.package.updateMany({
    data: { price: 2 }
  });
  
  // Make the first one 1 KES
  const first = await prisma.package.findFirst({ orderBy: { price: 'asc' } });
  if (first) {
    await prisma.package.update({
      where: { id: first.id },
      data: { price: 1 }
    });
  }
  
  console.log('Successfully updated all packages to 1 and 2 KES for testing.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
