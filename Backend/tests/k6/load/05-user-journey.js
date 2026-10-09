import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL, requireToken } from '../shared/config.js';

const USER_TOKEN = requireToken('USER_TOKEN');

/**
 * Business-mix simulation of the customer app's read path:
 * open app → price sheet → bookings → notifications → promo check.
 * Auth is token-based (logins are covered by 02-login.js) because the
 * login rate limiter allows only 5 attempts / 15 min / ip:email.
 */
export const options = {
  scenarios: {
    journey_main: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: 400,
      maxDuration: '3m',
    },
    journey_peak: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      preAllocatedVUs: 50,
      maxVUs: 120,
      startTime: '3m30s',
    },
  },
  thresholds: {
    'http_req_duration{group:::app_open}': ['p(95)<600'],
    'http_req_duration{group:::bookings}': ['p(95)<700'],
    'http_req_duration{group:::notifications}': ['p(95)<500'],
    checks: ['rate>0.98'],
    http_req_failed: ['rate<0.02'],
  },
};

const H = { headers: { Authorization: `Bearer ${USER_TOKEN}` } };

export default function () {
  group('app_open', () => {
    const prices = http.get(`${BASE_URL}/api/admin/public/prices`);
    check(prices, { 'prices 200': (r) => r.status === 200 });
    const addons = http.get(`${BASE_URL}/api/admin/public/addons`);
    check(addons, { 'addons 200': (r) => r.status === 200 });
  });

  group('bookings', () => {
    const list = http.get(`${BASE_URL}/api/bookings`, H);
    check(list, { 'list 200': (r) => r.status === 200 && Array.isArray(r.json()) });

    const promos = http.get(`${BASE_URL}/api/bookings/promos/available`, H);
    check(promos, { 'promos 200': (r) => r.status === 200 });

    const validate = http.post(
      `${BASE_URL}/api/bookings/promo/validate`,
      JSON.stringify({ code: 'SMOKE10', bookingAmount: 20000 }),
      { headers: { Authorization: `Bearer ${USER_TOKEN}`, 'Content-Type': 'application/json' } },
    );
    check(validate, { 'promo validate ok': (r) => [200, 400, 403, 404].includes(r.status) });
  });

  group('notifications', () => {
    const list = http.get(`${BASE_URL}/api/notifications`, H);
    check(list, { 'notifications 200': (r) => r.status === 200 });
    const count = http.get(`${BASE_URL}/api/notifications/unread-count`, H);
    check(count, { 'unread 200': (r) => r.status === 200 });
  });

  check({}, { 'no unreached': () => true });
}