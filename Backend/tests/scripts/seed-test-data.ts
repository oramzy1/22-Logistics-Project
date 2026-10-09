import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'node:fs';
import path from 'node:path';
import { ids } from '../helpers/auth';

const prisma = new PrismaClient();

const PASSWORD = process.env.SMOKE_PASSWORD || 'Sm0ke!Pass123';

const EMAILS = {
  admin: 'smoke-admin@22logistics.test',
  user: 'smoke-user@22logistics.test',
  userOther: 'smoke-user2@22logistics.test',
  userSwitch: 'smoke-switch@22logistics.test',
  business: 'smoke-business@22logistics.test',
  driver: 'smoke-driver@22logistics.test',
};

async function upsertUser(opts: {
  id: string; email: string; name: string; role: 'INDIVIDUAL' | 'BUSINESS' | 'DRIVER' | 'ADMIN';
}) {
  return prisma.user.upsert({
    where: { id: opts.id },
    update: { isActive: true, isVerified: true, isDeleted: false },
    create: {
      id: opts.id,
      email: opts.email,
      name: opts.name,
      role: opts.role,
      phone: '+2348012345678',
      password: await bcrypt.hash(PASSWORD, 10),
      isVerified: true,
      isActive: true,
      authProvider: 'email',
    },
  });
}

async function main() {
  await upsertUser({ id: ids.admin, email: EMAILS.admin, name: 'Smoke Admin', role: 'ADMIN' });
  await upsertUser({ id: ids.user, email: EMAILS.user, name: 'Smoke User', role: 'INDIVIDUAL' });
  await upsertUser({ id: ids.userOther, email: EMAILS.userOther, name: 'Smoke Other', role: 'INDIVIDUAL' });
  await upsertUser({ id: ids.business, email: EMAILS.business, name: 'Smoke Biz Admin', role: 'BUSINESS' });
  await upsertUser({ id: ids.driver, email: EMAILS.driver, name: 'Smoke Driver', role: 'DRIVER' });

  // Dedicated user for the switch-to-business test (role is reset on every seed)
  await prisma.user.upsert({
    where: { id: ids.userSwitch },
    update: { role: 'INDIVIDUAL', isActive: true, isVerified: true, isDeleted: false },
    create: {
      id: ids.userSwitch,
      email: EMAILS.userSwitch,
      name: 'Smoke Switch',
      role: 'INDIVIDUAL',
      password: await bcrypt.hash(PASSWORD, 10),
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.businessProfile.upsert({
    where: { userId: ids.business },
    update: {},
    create: {
      userId: ids.business,
      companyName: 'Smoke Logistics Ltd',
      companyEmail: EMAILS.business,
      companyAddress: '1 Smoke Street, Lagos',
      companyPhone: '+2348012345678',
      adminName: 'Smoke Biz Admin',
      adminEmail: EMAILS.business,
      adminPhone: '+2348012345678',
      department: 'Operations',
    },
  });

  await prisma.driverProfile.upsert({
    where: { userId: ids.driver },
    update: { licenseStatus: 'APPROVED', isOnline: true, isAvailable: true, onlineStatus: 'ONLINE' },
    create: {
      id: ids.driverProfile,
      userId: ids.driver,
      licenseNumber: 'SMK-LIC-001',
      licenseStatus: 'APPROVED',
      isOnline: true,
      isAvailable: true,
      onlineStatus: 'ONLINE',
      vehicleType: 'Sedan',
      brandModel: 'Toyota Corolla',
      plateNumber: 'SMK-001',
      vehicleColor: 'Silver',
    },
  });

  const now = Date.now();
  const past = new Date(now - 2 * 24 * 3600 * 1000);
  const active = new Date(now - 60 * 60 * 1000);
  const accepted = new Date(now + 2 * 3600 * 1000);

  // Completed booking (customer: userOther, driver: driver) — rating / demographics / history
  await prisma.booking.upsert({
    where: { id: ids.bookingCompleted },
    update: { status: 'COMPLETED', paymentStatus: 'PAID' },
    create: {
      id: ids.bookingCompleted,
      customerId: ids.userOther,
      driverId: ids.driver,
      pickupAddress: '12 Awolowo Road, Ikoyi',
      dropoffAddress: 'Victoria Island, Lagos',
      scheduledAt: past,
      packageType: '3 Hours',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentRef: 'SMK-REF-COMPLETED',
      totalAmount: 20000,
      rideType: 'INDIVIDUAL',
    },
  });
  // allow re-rating after a re-seed
  await prisma.driverReview.deleteMany({ where: { bookingId: ids.bookingCompleted } });

  // In-progress booking (customer: user, driver: driver) — trips/active, stops, quotes
  await prisma.booking.upsert({
    where: { id: ids.bookingActive },
    update: { status: 'IN_PROGRESS', paymentStatus: 'PAID' },
    create: {
      id: ids.bookingActive,
      customerId: ids.user,
      driverId: ids.driver,
      pickupAddress: 'Lekki Phase 1, Lagos',
      dropoffAddress: 'Ikeja GRA, Lagos',
      scheduledAt: active,
      packageType: '3 Hours',
      status: 'IN_PROGRESS',
      paymentStatus: 'PAID',
      paymentRef: 'SMK-REF-ACTIVE',
      totalAmount: 25000,
      rideType: 'INDIVIDUAL',
    },
  });
  await prisma.tripStop.deleteMany({ where: { bookingId: ids.bookingActive } });

  // Accepted booking (customer: business, driver: driver) — used by the lifecycle test
  await prisma.booking.upsert({
    where: { id: ids.bookingAccepted },
    update: { status: 'ACCEPTED', paymentStatus: 'PAID', driverId: ids.driver },
    create: {
      id: ids.bookingAccepted,
      customerId: ids.business,
      driverId: ids.driver,
      pickupAddress: 'Yaba, Lagos',
      dropoffAddress: 'Airport Road, Ikeja',
      scheduledAt: accepted,
      packageType: '3 Hours',
      status: 'ACCEPTED',
      paymentStatus: 'PAID',
      paymentRef: 'SMK-REF-ACCEPTED',
      totalAmount: 18000,
      rideType: 'BUSINESS',
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'SMOKE10' },
    update: { isActive: true },
    create: {
      id: ids.promo,
      code: 'SMOKE10',
      description: '10% off smoke tests',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      isActive: true,
      createdBy: ids.admin,
    },
  });

  await prisma.supportTicket.upsert({
    where: { ticketId: ids.ticketRef },
    update: {},
    create: {
      id: ids.ticketDb,
      ticketId: ids.ticketRef,
      userId: ids.userOther,
      subject: 'Smoke test ticket',
      description: undefined as never,
      category: 'OTHER',
      messages: {
        create: { senderId: ids.userOther, body: 'Initial smoke message', isAdmin: false },
      },
    } as any,
  });

  const out = { ...ids, emails: EMAILS };
  fs.writeFileSync(path.join(__dirname, '..', 'fixtures', 'test-ids.json'), JSON.stringify(out, null, 2));
  console.log('Seed complete:\n' + JSON.stringify(out, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());