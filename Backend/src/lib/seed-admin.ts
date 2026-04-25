import bcrypt from 'bcryptjs';
import prisma from './prisma';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'giftoramabo@gmail.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe@2026!';
  const name = process.env.ADMIN_NAME ?? 'Super Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      authProvider: 'email',
    },
  });

  // Seed default prices
  const defaults = [
    { key: 'price_3_hours',      value: '24000', label: '3 Hours' },
    { key: 'price_6_hours',      value: '34000', label: '6 Hours' },
    { key: 'price_10_hours',     value: '54000', label: '10 Hours' },
    { key: 'price_airport',      value: '80000', label: 'Airport Schedule' },
    { key: 'price_multiday',     value: '80000', label: 'Multi-day' },
    { key: 'ext_price_1_hour',   value: '10000', label: 'Extension 1 Hour' },
    { key: 'ext_price_2_hours',  value: '15000', label: 'Extension 2 Hours' },
    { key: 'ext_price_3_hours',  value: '24000', label: 'Extension 3 Hours' },
  ];

  for (const setting of defaults) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Admin seeded: ${email}`);
  console.log(`✅ Default prices seeded`);
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());