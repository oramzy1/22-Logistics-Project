import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { env } from '../helpers/env';
import { ids, tokens } from '../helpers/auth';

const describeLifecycle = env.runTripLifecycle ? describe : describe.skip;

/**
 * Full happy-path trip lifecycle against the seeded ACCEPTED booking.
 * Run `npm run seed` before enabling RUN_TRIP_LIFECYCLE=1 (it resets the booking).
 */
describeLifecycle('trip lifecycle (opt-in: RUN_TRIP_LIFECYCLE=1)', () => {
  it('arrive → start → stops → end → customer rating', async () => {
    const arrive = await http.patch(`/api/driver/trips/${ids.bookingAccepted}/arrive`, { token: tokens.driver });
    expect(arrive.status).toBe(200);
    expect(arrive.body.booking.status).toBe('ARRIVED');

    const start = await http.patch(`/api/driver/trips/${ids.bookingAccepted}/start`, { token: tokens.driver });
    expect(start.status).toBe(200);
    expect(start.body.booking.status).toBe('IN_PROGRESS');

    const addStop = await http.post('/api/driver/trips/stops', {
      token: tokens.driver,
      body: { bookingId: ids.bookingAccepted, address: 'Intermediate stop, Lagos', lat: 6.5, lng: 3.4 },
    });
    expect(addStop.status).toBe(201);
    expect(addStop.body.stop.stopOrder).toBeGreaterThanOrEqual(1);

    const stops = await http.get(`/api/driver/trips/${ids.bookingAccepted}/stops`, { token: tokens.driver });
    expect(stops.status).toBe(200);
    expect(stops.body.length).toBe(1);

    const active = await http.get('/api/driver/trips/active', { token: tokens.driver });
    expect(active.status).toBe(200);

    const end = await http.patch(`/api/driver/trips/${ids.bookingAccepted}/end`, { token: tokens.driver });
    expect(end.status).toBe(200);
    expect(end.body.booking.status).toBe('COMPLETED');

    const rate = await http.post(`/api/bookings/${ids.bookingAccepted}/rate-driver`, {
      token: tokens.business,
      body: { rating: 5, comment: 'Lifecycle complete' },
    });
    expect([200, 400]).toContain(rate.status);

    const stats = await http.get(`/api/users/${ids.driver}/rating-stats`, { token: tokens.business });
    expect(stats.status).toBe(200);
    expect(stats.body.totalRatings).toBeGreaterThanOrEqual(1);
  }, 40000);
});