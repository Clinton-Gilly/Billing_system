/**
 * Database seed script
 * Run: npx prisma db seed
 * or:  node prisma/seed.js
 */
const prisma = require('../src/models/prisma.client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ───────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotspotbilling.co.ke' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@hotspotbilling.co.ke',
      phone: '0700000000',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── Sample Customer ──────────────────────────────────────
  const customerPass = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer@example.com',
      phone: '0712345678',
      password: customerPass,
      role: 'CUSTOMER',
    },
  });
  console.log(`✅ Customer: ${customer.email}`);

  // ─── Packages ─────────────────────────────────────────────
  const packages = [
    {
      name: '1 Hour',
      description: 'High-speed internet for 1 hour',
      price: 1,
      duration: 1,
      speed: '5M/5M',
      dataLimit: null,
      mikrotikProfile: '1_Hour_Profile',
    },
    {
      name: '24 Hours',
      description: 'Unlimited internet for 24 hours',
      price: 2,
      duration: 24,
      speed: '5M/5M',
      dataLimit: null,
      mikrotikProfile: '24_Hour_Profile',
    },
    {
      name: '7 Days',
      description: 'Unlimited internet for 1 week',
      price: 2,
      duration: 168, // 7 * 24
      speed: '5M/5M',
      dataLimit: null,
      mikrotikProfile: 'weekly-plus',
    },
    {
      name: 'Monthly — Premium',
      description: '30 days at 10Mbps, unlimited data',
      price: 1500,
      duration: 720, // 30 * 24
      speed: '10M/10M',
      dataLimit: null,
      mikrotikProfile: 'monthly-premium',
    },
  ];

  for (const pkg of packages) {
    const created = await prisma.package.upsert({
      where: { id: pkg.mikrotikProfile }, // won't match — just upsert create
      update: {},
      create: pkg,
    }).catch(async () => {
      // If cuid conflict, just create
      return prisma.package.create({ data: pkg });
    });
    console.log(`✅ Package: ${pkg.name} — KES ${pkg.price}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────');
  console.log('Admin Login:');
  console.log('  Email:    admin@hotspotbilling.co.ke');
  console.log('  Password: Admin123!');
  console.log('─────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
