import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, requireToken } from '../shared/config.js';

const USER_TOKEN = requireToken('USER_TOKEN');

const jsonHeaders = {
  headers: { Authorization: `Bearer ${USER_TOKEN}`, 'Content-Type': 'application/json' },
};

/**
 * Write-path stress: support-ticket creation (INSERT + notification side effects)
 * interleaved with notification reads (SELECT + UPDATE on read-all).
 * Writes are intentionally chosen because they need no Paystack/Cloudinary.
 */
export const options = {
  scenarios: {
    writes: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 40,
      maxVUs: 100,
    },
    writes_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      stages: [
        { duration: '30s', target: 40 },
        { duration: '1m', target: 40 },
        { duration: '30s', target: 0 },
      ],
      preAllocatedVUs: 60,
      maxVUs: 150,
      startTime: '2m30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1200', 'p(99)<3000'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.98'],
  },
};

export default function () {
  const r = Math.random();
  let res;

  if (r < 0.45) {
    res = http.post(
      `${BASE_URL}/api/support/tickets`,
      JSON.stringify({
        subject: `Stress ${__VU}-${__ITER}`,
        description: 'Write-path stress ticket created by k6.',
        category: 'OTHER',
      }),
      jsonHeaders,
    );
    check(res, { 'ticket created': (x) => x.status === 201 });
  } else if (r < 0.7) {
    res = http.get(`${BASE_URL}/api/notifications`, jsonHeaders);
    check(res, { 'notifications 200': (x) => x.status === 200 });
  } else if (r < 0.85) {
    res = http.post(
      `${BASE_URL}/api/notifications/push-token`,
      JSON.stringify({ pushToken: `ExponentPushToken[stress-${__VU}-${__ITER}]` }),
      jsonHeaders,
    );
    check(res, { 'push token saved': (x) => x.status === 200 });
  } else {
    res = http.post(
      `${BASE_URL}/api/bookings/promo/validate`,
      JSON.stringify({ code: 'SMOKE10', bookingAmount: 20000 }),
      jsonHeaders,
    );
    check(res, { 'promo validate handled': (x) => [200, 400, 403, 404].includes(x.status) });
  }
  check(res, { 'no 5xx': (x) => x.status < 500 });
}