import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { ids, tokens } from '../helpers/auth';
import { env } from '../helpers/env';
import { validBookingPayload } from '../helpers/factories';

describe('bookings /api/bookings', () => {
  it('401 without token', async () => {
    expect((await http.get('/api/bookings')).status).toBe(401);
  });

  it('driver token cannot create a booking → 403', async () => {
    const res = await http.post('/api/bookings', { token: tokens.driver, body: validBookingPayload() });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  it('POST with missing fields → 400', async () => {
    const res = await http.post('/api/bookings', { token: tokens.user, body: { pickupAddress: 'x' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it('POST with pickup less than 2h away → 400 (time rule)', async () => {
    const soon = new Date(Date.now() + 30 * 60 * 1000);
    const res = await http.post('/api/bookings', {
      token: tokens.user,
      body: validBookingPayload({ scheduledAt: soon.toISOString() }),
    });
    expect(res.status).toBe(400);
  });

  it('POST with pickup outside 07:00-22:00 window → 400 (operating hours)', async () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(3, 0, 0, 0); // 03:00
    const res = await http.post('/api/bookings', {
      token: tokens.user,
      body: validBookingPayload({ scheduledAt: t.toISOString() }),
    });
    expect(res.status).toBe(400);
  });

  it('GET / returns own bookings as an array (contains seeded active trip)', async () => {
    const res = await http.get('/api/bookings', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b: any) => b.id === ids.bookingActive)).toBe(true);
  });

  it('GET /:id of another customer’s booking → 404 (ownership)', async () => {
    const res = await http.get(`/api/bookings/${ids.bookingCompleted}`, { token: tokens.user });
    expect(res.status).toBe(404);
  });

  it('GET /:id of own booking → 200', async () => {
    const res = await http.get(`/api/bookings/${ids.bookingActive}`, { token: tokens.user });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ids.bookingActive);
    expect(res.body.customerId ?? res.body.customer?.id).toBeTruthy();
  });

  it('GET /verify/:reference for an unknown reference → 4xx (retries Paystack up to 5x)', async () => {
    const res = await http.get('/api/bookings/verify/SMK-DOES-NOT-EXIST', { token: tokens.user });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  }, 40000);

  it('POST /promo/validate with unknown code → 4xx', async () => {
    const res = await http.post('/api/bookings/promo/validate', {
      token: tokens.user,
      body: { code: 'NO-SUCH-CODE-XYZ', bookingAmount: 20000 },
    });
    expect([400, 403, 404]).toContain(res.status);
    expect(res.body.message).toBeTruthy();
  });

  it('POST /promo/validate with seeded SMOKE10 → 200 discount', async () => {
    const res = await http.post('/api/bookings/promo/validate', {
      token: tokens.user,
      body: { code: 'SMOKE10', bookingAmount: 20000 },
    });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.discountAmount).toBe(2000);
    expect(res.body.finalAmount).toBe(18000);
  });

  it('driver token on /promo/validate → 403', async () => {
    const res = await http.post('/api/bookings/promo/validate', {
      token: tokens.driver,
      body: { code: 'SMOKE10', bookingAmount: 20000 },
    });
    expect(res.status).toBe(403);
  });

  it('GET /promos/available → 200 array', async () => {
    const res = await http.get('/api/bookings/promos/available', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /:id/cancel on unknown booking → 4xx', async () => {
    const res = await http.post('/api/bookings/nope/cancel', {
      token: tokens.user,
      body: { reason: 'smoke' },
    });
    expect([400, 404]).toContain(res.status);
  });

  it('POST /:id/rate-driver with rating out of range → 400', async () => {
    const res = await http.post(`/api/bookings/${ids.bookingCompleted}/rate-driver`, {
      token: tokens.userOther,
      body: { rating: 0, comment: 'bad' },
    });
    expect(res.status).toBe(400);
  });

  it('POST /:id/rate-driver on seeded completed booking → 200 first run, 400 on re-run', async () => {
    const res = await http.post(`/api/bookings/${ids.bookingCompleted}/rate-driver`, {
      token: tokens.userOther,
      body: { rating: 5, comment: 'Great smoke test ride' },
    });
    expect([200, 400]).toContain(res.status);
  });

  it('PATCH /:id/end on unknown booking → 4xx', async () => {
    const res = await http.patch('/api/bookings/nope/end', { token: tokens.user });
    expect([400, 404]).toContain(res.status);
  });

  it('POST /:id/reinitialize with invalid channel → 4xx', async () => {
    const res = await http.post(`/api/bookings/${ids.bookingActive}/reinitialize`, {
      token: tokens.user,
      body: { channel: 'bitcoin' },
    });
    expect([400, 404]).toContain(res.status);
  });

  it.runIf(env.runPaymentTests)(
    'POST / creates a booking and returns a Paystack authorization payload',
    async () => {
      const res = await http.post('/api/bookings', { token: tokens.user, body: validBookingPayload() });
      expect(res.status).toBe(201);
      expect(res.body.booking.id).toBeTruthy();
      expect(res.body.payment.authorizationUrl).toBeTruthy();
      expect(res.body.payment.reference).toBeTruthy();
    },
    30000,
  );
});