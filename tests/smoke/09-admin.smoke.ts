import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { env } from '../helpers/env';
import { ids, tokens } from '../helpers/auth';
import { uniq, uniqueEmail } from '../helpers/factories';

describe('admin auth /api/admin/auth', () => {
  it('POST /login wrong password → 401', async () => {
    const res = await http.post('/api/admin/auth/login', {
      body: { email: env.smoke.adminEmail, password: 'Wrong!Pass999' },
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('POST /login unknown email → 401', async () => {
    const res = await http.post('/api/admin/auth/login', {
      body: { email: uniqueEmail('noadmin'), password: 'x' },
    });
    expect(res.status).toBe(401);
  });

  it('POST /login valid admin → 200 short-lived token + user shape', async () => {
    const res = await http.post('/api/admin/auth/login', {
      body: { email: env.smoke.adminEmail, password: env.smoke.password },
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('POST /login rate-limits at 6 attempts → 429', async () => {
    const email = `admin-rl-${Date.now()}@example.test`;
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await http.post('/api/admin/auth/login', { body: { email, password: 'x' } })).status);
    expect(statuses).toContain(429);
  }, 30000);
});

describe('admin protected /api/admin', () => {
  it('401 without token / 403 with non-admin token', async () => {
    expect((await http.get('/api/admin/dashboard')).status).toBe(401);
    expect((await http.get('/api/admin/dashboard', { token: tokens.user })).status).toBe(403);
    expect((await http.get('/api/admin/dashboard', { token: tokens.driver })).status).toBe(403);
    expect((await http.get('/api/admin/dashboard', { token: tokens.business })).status).toBe(403);
  });

  it('GET /dashboard → 200 with revenue/booking keys', async () => {
    const res = await http.get('/api/admin/dashboard', { token: tokens.admin });
    expect(res.status).toBe(200);
    for (const key of ['totalBookings', 'totalRevenue', 'activeDrivers', 'registeredUsers']) {
      expect(res.body).toHaveProperty(key);
    }
    expect(Array.isArray(res.body.recentTransactions)).toBe(true);
    expect(Array.isArray(res.body.weeklyRevenue)).toBe(true);
  });

  it('GET /charts?period=7d → 200 series payload', async () => {
    const res = await http.get('/api/admin/charts?period=7d', { token: tokens.admin });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.revenueData)).toBe(true);
    expect(Array.isArray(res.body.bookingData)).toBe(true);
    expect(res.body.rideBreakdown).toBeTruthy();
  });

  it('GET /audit-log paginates → {logs,total}', async () => {
    const res = await http.get('/api/admin/audit-log?page=1&limit=10', { token: tokens.admin });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /users paginates → {users,total,page,limit}', async () => {
    const res = await http.get('/api/admin/users?page=1&limit=5', { token: tokens.admin });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.limit).toBe(5);
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /users?search= finds the seeded user', async () => {
    const res = await http.get('/api/admin/users?search=smoke-user@22logistics.test', { token: tokens.admin });
    expect(res.status).toBe(200);
    expect(res.body.users.some((u: any) => u.id === ids.user)).toBe(true);
  });

  it('GET /users/:id unknown → 404; known → 200 with profiles', async () => {
    expect((await http.get('/api/admin/users/does-not-exist', { token: tokens.admin })).status).toBe(404);
    const res = await http.get(`/api/admin/users/${ids.driver}`, { token: tokens.admin });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ids.driver);
    expect(res.body.driverProfile).toBeTruthy();
  });

  it('PATCH /users/:id/role with invalid role → 400', async () => {
    const res = await http.patch(`/api/admin/users/${ids.user}/role`, {
      token: tokens.admin,
      body: { role: 'SUPERHERO' },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid role');
  });

  it('PATCH /users/:id/status toggles isActive and restores it', async () => {
    const off = await http.patch(`/api/admin/users/${ids.userSwitch}/status`, {
      token: tokens.admin,
      body: { isActive: false },
    });
    expect(off.status).toBe(200);
    expect(off.body.user.isActive).toBe(false);

    const on = await http.patch(`/api/admin/users/${ids.userSwitch}/status`, {
      token: tokens.admin,
      body: { isActive: true },
    });
    expect(on.body.user.isActive).toBe(true);
  });

  it('GET /bookings paginates + filters → {bookings,total,page,limit}', async () => {
    const res = await http.get('/api/admin/bookings?page=1&limit=5&status=COMPLETED', { token: tokens.admin });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('PATCH /bookings/:id/cancel unknown → 4xx', async () => {
    const res = await http.patch('/api/admin/bookings/does-not-exist/cancel', {
      token: tokens.admin,
      body: { reason: 'smoke' },
    });
    expect([400, 404]).toContain(res.status);
  });

  it('GET /drivers + /drivers/available → 200 arrays', async () => {
    const list = await http.get('/api/admin/drivers', { token: tokens.admin });
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.drivers)).toBe(true);

    const avail = await http.get('/api/admin/drivers/available', { token: tokens.admin });
    expect(avail.status).toBe(200);
    expect(Array.isArray(avail.body)).toBe(true);
  });

  it('POST /drivers/verify-license with invalid status → 400', async () => {
    const res = await http.post('/api/admin/drivers/verify-license', {
      token: tokens.admin,
      body: { driverProfileId: ids.driverProfile, status: 'MAYBE' },
    });
    expect(res.status).toBe(400);
  });

  it('POST /drivers/assign with unknown booking → 4xx', async () => {
    const res = await http.post('/api/admin/drivers/assign', {
      token: tokens.admin,
      body: { bookingId: 'does-not-exist', driverProfileId: ids.driverProfile },
    });
    expect([400, 404]).toContain(res.status);
  });

  it('GET /settings → 200 array; PATCH round-trips a value; invalid body → 400', async () => {
    const list = await http.get('/api/admin/settings', { token: tokens.admin });
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    const bad = await http.patch('/api/admin/settings', { token: tokens.admin, body: { settings: 'not-an-array' } });
    expect(bad.status).toBe(400);

    const first = list.body[0];
    if (first) {
      const ok = await http.patch('/api/admin/settings', {
        token: tokens.admin,
        body: { settings: [{ key: first.key, value: String(first.value) }] },
      });
      expect(ok.status).toBe(200);
    }
  });

  it('promo lifecycle: create → list → toggle → delete', async () => {
    const code = `SMK${Date.now().toString().slice(-8)}`;
    const created = await http.post('/api/admin/promos', {
      token: tokens.admin,
      body: { code, description: 'smoke', discountType: 'PERCENTAGE', discountValue: 5 },
    });
    expect(created.status).toBe(201);
    const promoId = created.body.promo.id;

    const dup = await http.post('/api/admin/promos', {
      token: tokens.admin,
      body: { code, discountType: 'PERCENTAGE', discountValue: 5 },
    });
    expect(dup.status).toBe(400);

    const list = await http.get('/api/admin/promos', { token: tokens.admin });
    expect(list.status).toBe(200);
    expect(list.body.some((p: any) => p.code === code)).toBe(true);

    const toggled = await http.patch(`/api/admin/promos/${promoId}/toggle`, { token: tokens.admin });
    expect(toggled.status).toBe(200);
    expect(toggled.body.promo.isActive).toBe(false);

    const removed = await http.del(`/api/admin/promos/${promoId}`, { token: tokens.admin });
    expect(removed.status).toBe(200);
  });

  it('POST /promos/assign without userIds → 400/404', async () => {
    const res = await http.post('/api/admin/promos/assign', { token: tokens.admin, body: { userIds: [] } });
    expect([400, 404]).toContain(res.status);
  });

  it('addon lifecycle: create → list → patch → delete', async () => {
    const key = `smoke-addon-${Date.now()}`;
    const created = await http.post('/api/admin/addons', {
      token: tokens.admin,
      body: { label: `Smoke Addon ${key}`, price: 500 },
    });
    expect(created.status).toBe(201);
    const addonId = created.body.id ?? created.body.addon?.id;

    const list = await http.get('/api/admin/addons', { token: tokens.admin });
    expect(list.status).toBe(200);

    const patched = await http.patch(`/api/admin/addons/${addonId}`, {
      token: tokens.admin,
      body: { price: 750 },
    });
    expect(patched.status).toBe(200);

    const removed = await http.del(`/api/admin/addons/${addonId}`, { token: tokens.admin });
    expect(removed.status).toBe(200);
  });

  it('POST /addons without label → 400', async () => {
    const res = await http.post('/api/admin/addons', { token: tokens.admin, body: { price: 100 } });
    expect(res.status).toBe(400);
  });

  it('POST /promos/validate requires ADMIN despite its comment → 403 for users', async () => {
    const res = await http.post('/api/admin/promos/validate', {
      token: tokens.user,
      body: { code: 'SMOKE10', bookingAmount: 20000 },
    });
    expect(res.status).toBe(403);
  });

  it('GET /trips/demographics → 200 leaderboard payload', async () => {
    const res = await http.get('/api/admin/trips/demographics?limit=5', { token: tokens.admin });
    expect(res.status).toBe(200);
    for (const key of ['topPickups', 'topStops', 'topDropoffs', 'mostStopsPerUser', 'driverStopLeaderboard']) {
      expect(res.body).toHaveProperty(key);
    }
  });

  it('DELETE /users/:id unknown → 404', async () => {
    const res = await http.del('/api/admin/users/does-not-exist', { token: tokens.admin });
    expect(res.status).toBe(404);
  });
});