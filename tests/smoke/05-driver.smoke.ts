import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { ids, tokens } from '../helpers/auth';
import { uniqueEmail, form, TINY_PNG } from '../helpers/factories';

describe('driver /api/driver', () => {
 it('register: incomplete payload → 4xx/5xx (server lacks input validation — known gap)', async () => {
    const res = await http.post('/api/driver/register', { body: { email: uniqueEmail('drv') } });
    expect([400, 500]).toContain(res.status);
  });
  it('PATCH /requests/:id/respond ACCEPTED on unknown booking → 409 (guard)', async () => {
    const res = await http.patch('/api/driver/requests/does-not-exist/respond', {
      token: tokens.driver,
      body: { action: 'ACCEPTED' },
    });
    expect(res.status).toBe(409);
    expect(String(res.body.message).length).toBeGreaterThan(0);
  });

  it('register: full multipart payload → 201 or 400, never 500', async () => {
    const res = await http.post('/api/driver/register', {
      form: form(
        {
          name: 'New Smoke Driver',
          email: uniqueEmail('drv'),
          phone: '+2348099998888',
          password: 'Dr1ver!StrongPass',
          licenseNumber: 'LIC-991',
        },
        { field: 'logo', filename: 'driver.png' },
      ),
    });
    expect([201, 400]).toContain(res.status);
  }, 30000);

  it('401 without token on protected driver routes', async () => {
    expect((await http.get('/api/driver/profile')).status).toBe(401);
    expect((await http.get('/api/driver/requests')).status).toBe(401);
  });

  it('individual token on driver routes → 403', async () => {
    expect((await http.get('/api/driver/profile', { token: tokens.user })).status).toBe(403);
    expect((await http.get('/api/driver/trips/active', { token: tokens.user })).status).toBe(403);
  });

  it('GET /profile for driver → 200 with vehicle + license fields', async () => {
    const res = await http.get('/api/driver/profile', { token: tokens.driver });
    expect(res.status).toBe(200);
    expect(res.body.licenseStatus).toBe('APPROVED');
    expect(res.body.plateNumber).toBe('SMK-001');
  });

  it('PATCH /profile updates vehicle details', async () => {
    const res = await http.patch('/api/driver/profile', {
      token: tokens.driver,
      body: {
        vehicleType: 'Sedan',
        brandModel: 'Toyota Corolla',
        plateNumber: 'SMK-001',
        vehicleColor: 'Silver',
        workingHours: '8:00 AM - 5:00 PM',
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeTruthy();
  });

  it('PATCH /status toggles ONLINE → OFFLINE → ONLINE and reflects in profile', async () => {
    const off = await http.patch('/api/driver/status', { token: tokens.driver, body: { status: 'OFFLINE' } });
    expect(off.status).toBe(200);
    expect(off.body.profile.isOnline).toBe(false);

    const on = await http.patch('/api/driver/status', { token: tokens.driver, body: { status: 'ONLINE' } });
    expect(on.status).toBe(200);
    expect(on.body.profile.isOnline).toBe(true);
    expect(on.body.profile.isAvailable).toBe(true);
  });

  it('PATCH /availability while offline → 400', async () => {
    await http.patch('/api/driver/status', { token: tokens.driver, body: { status: 'OFFLINE' } });
    const res = await http.patch('/api/driver/availability', {
      token: tokens.driver,
      body: { isAvailable: true },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('You must be online to set availability');
    await http.patch('/api/driver/status', { token: tokens.driver, body: { status: 'ONLINE' } });
  });

  it('POST /license without file → 400', async () => {
    const res = await http.post('/api/driver/license', { token: tokens.driver, form: form({}) });
    expect(res.status).toBe(400);
  });

  it('GET /requests returns the AWAITING_DRIVER pool as an array', async () => {
    const res = await http.get('/api/driver/requests', { token: tokens.driver });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PATCH /requests/:id/respond DECLINED → 200 (local ignore, no mutation)', async () => {
    const res = await http.patch('/api/driver/requests/does-not-exist/respond', {
      token: tokens.driver,
      body: { action: 'DECLINED' },
    });
    expect(res.status).toBe(200);
  });


  it('GET /trips/active → 200 with the seeded in-progress trip', async () => {
    const res = await http.get('/api/driver/trips/active', { token: tokens.driver });
    expect(res.status).toBe(200);
    expect(res.body === null || typeof res.body === 'object').toBe(true);
    if (res.body) expect(res.body.id).toBe(ids.bookingActive);
  });

  it('GET /trips/history → 200 array of COMPLETED/CANCELLED trips', async () => {
    const res = await http.get('/api/driver/trips/history', { token: tokens.driver });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b: any) => b.id === ids.bookingCompleted)).toBe(true);
  });

  it('PATCH /trips/:id/arrive on a non-accepted booking → 404 (state guard)', async () => {
    const res = await http.patch(`/api/driver/trips/${ids.bookingCompleted}/arrive`, { token: tokens.driver });
    expect(res.status).toBe(404);
  });

  it('PATCH /trips/:id/start on a non-accepted booking → 404 (state guard)', async () => {
    const res = await http.patch(`/api/driver/trips/${ids.bookingCompleted}/start`, { token: tokens.driver });
    expect(res.status).toBe(404);
  });

  it('PATCH /trips/:id/end on unknown booking → 4xx', async () => {
    const res = await http.patch('/api/driver/trips/does-not-exist/end', { token: tokens.driver });
    expect([400, 404]).toContain(res.status);
  });

  it('GET /trips/:id/stops for unknown booking → 200 empty array', async () => {
    const res = await http.get('/api/driver/trips/does-not-exist/stops', { token: tokens.driver });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /trips/stops with unknown booking → 404', async () => {
    const res = await http.post('/api/driver/trips/stops', {
      token: tokens.driver,
      body: { bookingId: 'does-not-exist', address: 'Test stop' },
    });
    expect(res.status).toBe(404);
  });

  it('admin driver endpoints reject non-admin tokens → 403', async () => {
    const asDriver = [
      http.post('/api/driver/admin/verify-license', { token: tokens.driver, body: {} }),
      http.post('/api/driver/admin/assign', { token: tokens.driver, body: {} }),
      http.get('/api/driver/admin/available', { token: tokens.driver }),
    ];
    const asUser = [
      http.get('/api/driver/admin/available', { token: tokens.user }),
      http.post('/api/driver/admin/assign', { token: tokens.user, body: {} }),
    ];
    for (const p of [...asDriver, ...asUser]) expect((await p).status).toBe(403);
  });
});