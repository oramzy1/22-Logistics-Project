import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { env } from '../helpers/env';
import { ids, tokens } from '../helpers/auth';

describe('upgrades /api/upgrade', () => {
  it('401 without token', async () => {
    expect((await http.post('/api/upgrade', { body: {} })).status).toBe(401);
  });

  it('POST / without airportService → 400', async () => {
    const res = await http.post('/api/upgrade', {
      token: tokens.user,
      body: { bookingId: ids.bookingActive },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please choose an airport service');
  });

  it('POST / with unknown booking → 404', async () => {
    const res = await http.post('/api/upgrade', {
      token: tokens.user,
      body: { bookingId: 'does-not-exist', airportService: 'AIRPORT_PICKUP' },
    });
    expect(res.status).toBe(404);
  });

  it('POST / with a non-active booking → 400 (state guard)', async () => {
    const res = await http.post('/api/upgrade', {
      token: tokens.user,
      body: { bookingId: ids.bookingCompleted, airportService: 'AIRPORT_PICKUP' },
    });
    expect([400, 404]).toContain(res.status);
  });

  it('GET /quotes/:bookingId unknown → 404', async () => {
    const res = await http.get('/api/upgrade/quotes/does-not-exist', { token: tokens.user });
    expect(res.status).toBe(404);
  });

  it('GET /quotes/:bookingId on another customer’s booking → 404', async () => {
    const res = await http.get(`/api/upgrade/quotes/${ids.bookingCompleted}`, { token: tokens.user });
    expect(res.status).toBe(404);
  });

  it('GET /quotes/:bookingId on own active trip → 200 (or 400 if airport pricing missing)', async () => {
    const res = await http.get(`/api/upgrade/quotes/${ids.bookingActive}`, { token: tokens.user });
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.packageType).toBeTruthy();
      expect(Array.isArray(res.body.options)).toBe(true);
    }
  });

  it('GET /verify/:reference unknown → 404', async () => {
    const res = await http.get('/api/upgrade/verify/SMK-NO-REF', { token: tokens.user });
    expect(res.status).toBe(404);
  });

  it('GET /verify/:reference as non-owner → 403 or 404', async () => {
    const res = await http.get('/api/upgrade/verify/SMK-NO-REF', { token: tokens.userOther });
    expect([403, 404]).toContain(res.status);
  });

  it('POST /driver-request with unknown booking → 404', async () => {
    const res = await http.post('/api/upgrade/driver-request', {
      token: tokens.driver,
      body: { bookingId: 'does-not-exist' },
    });
    expect(res.status).toBe(404);
  });

  it('POST /driver-request on a customer-owned booking with user token → 4xx', async () => {
    const res = await http.post('/api/upgrade/driver-request', {
      token: tokens.user,
      body: { bookingId: ids.bookingActive },
    });
    expect([400, 403, 404]).toContain(res.status);
  });

  it.runIf(env.runPaymentTests)(
    'POST / creates an upgrade + Paystack payload on an active trip',
    async () => {
      const res = await http.post('/api/upgrade', {
        token: tokens.user,
        body: { bookingId: ids.bookingActive, airportService: 'AIRPORT_PICKUP' },
      });
      expect(res.status).toBe(201);
      expect(res.body.payment.authorizationUrl).toBeTruthy();
    },
    30000,
  );
});

describe('extensions /api/extensions', () => {
  it('401 without token', async () => {
    expect((await http.post('/api/extensions', { body: {} })).status).toBe(401);
  });

  it('POST / with unknown booking → 404', async () => {
    const res = await http.post('/api/extensions', {
      token: tokens.user,
      body: { bookingId: 'does-not-exist', hours: '1' },
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Booking not found');
  });

  it('POST / on someone else’s booking → 404 (customerId scope)', async () => {
    const res = await http.post('/api/extensions', {
      token: tokens.user,
      body: { bookingId: ids.bookingCompleted, hours: '1' },
    });
    expect(res.status).toBe(404);
  });

  it('POST / on an owner’s completed trip → 400 (state guard)', async () => {
    const res = await http.post('/api/extensions', {
      token: tokens.userOther,
      body: { bookingId: ids.bookingCompleted, hours: '1' },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Can only extend trips in progress');
  });

  it('POST / with malformed hours on the active trip → 400 before any payment init', async () => {
    const res = await http.post('/api/extensions', {
      token: tokens.user,
      body: { bookingId: ids.bookingActive, hours: 'abc' },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid extension option');
  });

  it('GET /verify/:reference unknown → 4xx', async () => {
    const res = await http.get('/api/extensions/verify/SMK-NO-EXT-REF');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  }, 40000);
});