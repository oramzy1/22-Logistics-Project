import jwt from 'jsonwebtoken';
import { env } from './env';

export type Role = 'INDIVIDUAL' | 'BUSINESS' | 'DRIVER' | 'ADMIN';

/** Must match scripts/seed-test-data.ts */
export const ids = {
  admin: 'smk-admin-001',
  user: 'smk-user-001',
  userOther: 'smk-user-002',
  userSwitch: 'smk-user-switch',
  business: 'smk-biz-001',
  driver: 'smk-driver-001',
  driverProfile: 'smk-driver-profile-001',
  bookingActive: 'smk-booking-active',
  bookingCompleted: 'smk-booking-completed',
  bookingAccepted: 'smk-booking-accepted',
  promo: 'smk-promo-001',
  ticketDb: 'smk-ticket-001',
  ticketRef: 'TKT-SMK-001',
};

export function mint(id: string, role: Role, expiresIn = '1h'): string {
  return jwt.sign({ id, role }, env.jwtSecret, { expiresIn: jwt.SignOptions['expiresIn'] as any });
}

export const tokens = {
  admin: mint(ids.admin, 'ADMIN', '2h'),
  user: mint(ids.user, 'INDIVIDUAL'),
  userOther: mint(ids.userOther, 'INDIVIDUAL'),
  userSwitch: mint(ids.userSwitch, 'INDIVIDUAL'),
  business: mint(ids.business, 'BUSINESS'),
  driver: mint(ids.driver, 'DRIVER'),
};

export const bearer = (t?: string | null) => (t ? { Authorization: `Bearer ${t}` } : {});