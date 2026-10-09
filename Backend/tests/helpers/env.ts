import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const env = {
  baseUrl: (process.env.API_BASE_URL || 'http://localhost:5000').replace(/\/$/, ''),
  socketUrl: (process.env.API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, ''),
  jwtSecret: process.env.JWT_SECRET || 'secret',
  paystackSecret: process.env.PAYSTACK_SECRET_KEY || '',
  runPaymentTests: process.env.RUN_PAYMENT_TESTS === '1',
  runTripLifecycle: process.env.RUN_TRIP_LIFECYCLE === '1',
  smoke: {
    email: process.env.SMOKE_EMAIL || 'smoke-user@22logistics.test',
    password: process.env.SMOKE_PASSWORD || 'Sm0ke!Pass123',
    adminEmail: process.env.SMOKE_ADMIN_EMAIL || 'smoke-admin@22logistics.test',
    driverEmail: process.env.SMOKE_DRIVER_EMAIL || 'smoke-driver@22logistics.test',
  },
};