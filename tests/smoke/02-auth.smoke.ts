import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { env } from '../helpers/env';
import { tokens } from '../helpers/auth';
import { uniqueEmail, form } from '../helpers/factories';

describe('auth /api/auth', () => {
  // registerLimiter = 5/hour/IP; a spent shared-IP budget returns 429. Tolerate it.
  it('register: validates payload or is rate-limited (429 tolerated)', async () => {
    const res = await http.post('/api/auth/register', { body: { email: uniqueEmail() } });
    expect([400, 500, 429]).toContain(res.status);
  });

  it('register: duplicate seeded email rejected when not rate-limited', async () => {
    const res = await http.post('/api/auth/register', {
      body: { email: env.smoke.email, password: 'An0ther!Pass99', name: 'Dup', phone: '+2348000000001' },
    });
    if (res.status === 429) return; // shared-IP budget spent
    expect(res.status).toBe(400);
    expect(String(res.body.message).toLowerCase()).toContain('already exists');
  });

  it('login: unknown email → 404 (documents account enumeration)', async () => {
    const res = await http.post('/api/auth/login', { body: { email: uniqueEmail(), password: 'whatever!123' } });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('login: wrong password → 400 Invalid credentials', async () => {
    const res = await http.post('/api/auth/login', { body: { email: env.smoke.email, password: 'WrongPass!999' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('login: valid individual → 200 with token and user shape', async () => {
    const res = await http.post('/api/auth/login', {
      body: { email: env.smoke.email, password: env.smoke.password, appType: 'user-app' },
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('INDIVIDUAL');
    expect(res.body.user.isVerified).toBe(true);
    expect(res.body.user).toHaveProperty('businessProfile');
  });

  it('login: driver account on driver-app → 200', async () => {
    const res = await http.post('/api/auth/login', {
      body: { email: env.smoke.driverEmail, password: env.smoke.password, appType: 'driver-app' },
    });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('DRIVER');
    expect(res.body.user.driverProfile).toBeTruthy();
  });

  it('login: individual account rejected on driver-app → 403 (429 tolerated)', async () => {
    const res = await http.post('/api/auth/login', {
      body: { email: env.smoke.email, password: env.smoke.password, appType: 'driver-app' },
    });
    if (res.status === 429) return; // loginLimiter 5/15min per ip:email on a shared IP
    expect(res.status).toBe(403);
  });

  it('login: rate limiter trips at 6 attempts for the same ip:email → 429', async () => {
    const email = `ratelimit-${Date.now()}@example.test`;
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await http.post('/api/auth/login', { body: { email, password: 'nope!nope123' } });
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
    expect(statuses.slice(0, 5).every((s) => s !== 429)).toBe(true);
  }, 30000);

  it('verify-email: invalid code → 400', async () => {
    const res = await http.post('/api/auth/verify-email', { body: { email: env.smoke.email, code: '000000' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid or expired code.');
  });

  it('forgot-password: enumeration-safe → 200 even for unknown email', async () => {
    const res = await http.post('/api/auth/forgot-password', { body: { email: uniqueEmail() } });
    expect(res.status).toBe(200);
  });

  it('verify-reset-code: invalid code → 400', async () => {
    const res = await http.post('/api/auth/verify-reset-code', { body: { email: uniqueEmail(), code: '999999' } });
    expect(res.status).toBe(400);
  });

  it('reset-password: invalid code → 400', async () => {
    const res = await http.post('/api/auth/reset-password', {
      body: { email: uniqueEmail(), code: '999999', newPassword: 'Str0ng!Password9' },
    });
    expect(res.status).toBe(400);
  });

  it('google: invalid idToken → 4xx, never 200', async () => {
    const res = await http.post('/api/auth/google', { body: { idToken: 'garbage.token.here', mode: 'signin' } });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('apple: invalid identityToken → 400', async () => {
    const res = await http.post('/api/auth/apple', { body: { identityToken: 'garbage' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid Apple token');
  });

  it('complete-business-profile: 401 without token', async () => {
    const res = await http.post('/api/auth/complete-business-profile', {
      form: form({ companyName: 'X' }),
    });
    expect(res.status).toBe(401);
  });

  it('complete-driver-profile: 400 when license file missing', async () => {
    const res = await http.post('/api/auth/complete-driver-profile', {
      token: tokens.driver,
      form: form({ licenseNumber: 'L-1' }),
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('License image is required');
  });
});