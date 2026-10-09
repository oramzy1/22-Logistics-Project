import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { tokens } from '../helpers/auth';

type Res = { status: number };

/**
 * Data-driven role matrix.
 * Invalid-payload trick: a wrong-role request must be rejected with 403 *before*
 * validation, so the "right" roles answer 400 (validation) instead of 403.
 */
interface Case {
  name: string;
  run: (token?: string) => Promise<Res>;
  expect: { anon: number[]; user: number[]; driver: number[]; admin: number[] };
}

const cases: Case[] = [
  {
    name: 'GET /api/users/me',
    run: (t) => http.get('/api/users/me', { token: t }),
    expect: { anon: [401], user: [200], driver: [200], admin: [200] },
  },
  {
    name: 'POST /api/bookings (invalid payload)',
    run: (t) => http.post('/api/bookings', { token: t, body: { pickupAddress: 'x' } }),
    expect: { anon: [401], user: [400], driver: [403], admin: [403] },
  },
  {
    name: 'POST /api/bookings/promo/validate (invalid payload)',
    run: (t) => http.post('/api/bookings/promo/validate', { token: t, body: {} }),
    expect: { anon: [401], user: [400, 500], driver: [403], admin: [403] },
  },
  {
    name: 'POST /api/admin/promos (invalid payload)',
    run: (t) => http.post('/api/admin/promos', { token: t, body: {} }),
    expect: { anon: [401], user: [403], driver: [403], admin: [400, 500] },
  },
  {
    name: 'GET /api/driver/profile',
    run: (t) => http.get('/api/driver/profile', { token: t }),
    expect: { anon: [401], user: [403], driver: [200, 404], admin: [403] },
  },
  {
    name: 'GET /api/driver/requests',
    run: (t) => http.get('/api/driver/requests', { token: t }),
    expect: { anon: [401], user: [403], driver: [200], admin: [403] },
  },
  {
    name: 'GET /api/admin/dashboard',
    run: (t) => http.get('/api/admin/dashboard', { token: t }),
    expect: { anon: [401], user: [403], driver: [403], admin: [200] },
  },
  {
    name: 'GET /api/admin/users',
    run: (t) => http.get('/api/admin/users', { token: t }),
    expect: { anon: [401], user: [403], driver: [403], admin: [200] },
  },
  {
    name: 'GET /api/admin/settings',
    run: (t) => http.get('/api/admin/settings', { token: t }),
    expect: { anon: [401], user: [403], driver: [403], admin: [200] },
  },
  {
    name: 'GET /api/support/stats',
    run: (t) => http.get('/api/support/stats', { token: t }),
    expect: { anon: [401], user: [403], driver: [403], admin: [200] },
  },
  {
    name: 'GET /api/driver/admin/available',
    run: (t) => http.get('/api/driver/admin/available', { token: t }),
    expect: { anon: [401], user: [403], driver: [403], admin: [200] },
  },
];

describe('RBAC matrix', () => {
  for (const c of cases) {
    it(`${c.name} → anon ${c.expect.anon} | user ${c.expect.user} | driver ${c.expect.driver} | admin ${c.expect.admin}`, async () => {
      const anon = await c.run(undefined);
      expect(c.expect.anon).toContain(anon.status);

      const user = await c.run(tokens.user);
      expect(c.expect.user).toContain(user.status);

      const driver = await c.run(tokens.driver);
      expect(c.expect.driver).toContain(driver.status);

      const admin = await c.run(tokens.admin);
      expect(c.expect.admin).toContain(admin.status);
    });
  }

  it('garbage JWT is treated as unauthenticated (401), not as a role', async () => {
    const res = await http.get('/api/admin/dashboard', { token: 'eyJhbGciOiJIUzI1NiJ9.garbage.sig' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('token signed with a different secret is rejected → 401', async () => {
    const jwt = await import('jsonwebtoken');
    const forged = jwt.default.sign({ id: 'smk-admin-001', role: 'ADMIN' }, 'not-the-server-secret');
    const res = await http.get('/api/admin/dashboard', { token: forged });
    expect(res.status).toBe(401);
  });
});