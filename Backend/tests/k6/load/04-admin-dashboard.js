import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, requireToken } from '../shared/config.js';

const ADMIN_TOKEN = requireToken('ADMIN_TOKEN');

export const options = {
  scenarios: {
    admin_dashboard: {
      executor: 'constant-arrival-rate',
      rate: 10,               // admin dashboard is low-QPS but query-heavy
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 30,
      maxVUs: 80,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

const H = { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } };

export default function () {
  const r = Math.random();
  let res;

  if (r < 0.30) {
    // Redis cache (10s TTL) — most iterations should be cache hits
    res = http.get(`${BASE_URL}/api/admin/dashboard`, H);
    check(res, { 'dashboard 200': (x) => x.status === 200 && x.json().hasOwnProperty('totalBookings') });
  } else if (r < 0.55) {
    res = http.get(`${BASE_URL}/api/admin/users?page=${1 + Math.floor(Math.random() * 20)}&limit=25`, H);
    check(res, { 'users 200': (x) => x.status === 200 && Array.isArray(x.json().users) });
  } else if (r < 0.80) {
    res = http.get(`${BASE_URL}/api/admin/bookings?page=${1 + Math.floor(Math.random() * 20)}&limit=25`, H);
    check(res, { 'bookings 200': (x) => x.status === 200 && Array.isArray(x.json().bookings) });
  } else {
    res = http.get(`${BASE_URL}/api/admin/charts?period=7d`, H);
    check(res, { 'charts 200': (x) => x.status === 200 && Array.isArray(x.json().revenueData) });
  }
  check(res, { 'no 5xx': (x) => x.status < 500 });
}