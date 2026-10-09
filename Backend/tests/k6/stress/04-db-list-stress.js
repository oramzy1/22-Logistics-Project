import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, requireToken } from '../shared/config.js';

const ADMIN_TOKEN = requireToken('ADMIN_TOKEN');
const H = { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } };

/**
 * Database stress: unbounded/paginated admin lists, LIKE searches and
 * raw-SQL analytics under sustained concurrency. All responses must be 200 —
 * a single 500 here means pool exhaustion or a query timeout.
 */
export const options = {
  scenarios: {
    db_reads: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '2m', target: 25 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<4000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

const TERMS = ['a', 'smoke', 'lagos', 'test', 'driver', 'booking'];

export default function () {
  const r = Math.random();
  let res;

  if (r < 0.3) {
    const page = 1 + Math.floor(Math.random() * 100); // deep pagination
    res = http.get(`${BASE_URL}/api/admin/users?page=${page}&limit=100`, H);
    check(res, { 'users page 200': (x) => x.status === 200 && Array.isArray(x.json().users) });
  } else if (r < 0.55) {
    const term = TERMS[Math.floor(Math.random() * TERMS.length)];
    res = http.get(`${BASE_URL}/api/admin/bookings?search=${term}&page=1&limit=50`, H);
    check(res, { 'bookings search 200': (x) => x.status === 200 && Array.isArray(x.json().bookings) });
  } else if (r < 0.75) {
    res = http.get(`${BASE_URL}/api/admin/audit-log?page=1&limit=100`, H);
    check(res, { 'audit 200': (x) => x.status === 200 && Array.isArray(x.json().logs) });
  } else if (r < 0.9) {
    res = http.get(`${BASE_URL}/api/admin/trips/demographics?limit=25`, H);
    check(res, { 'demographics 200': (x) => x.status === 200 });
  } else {
    res = http.get(`${BASE_URL}/api/admin/drivers?licenseStatus=PENDING&limit=50`, H);
    check(res, { 'drivers 200': (x) => x.status === 200 });
  }
  check(res, { 'no 5xx': (x) => x.status < 500 });
}