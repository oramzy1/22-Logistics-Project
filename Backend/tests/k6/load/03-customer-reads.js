import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, requireToken } from '../shared/config.js';

const USER_TOKEN = requireToken('USER_TOKEN');

export const options = {
  scenarios: {
    customer_reads: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '3m',
      preAllocatedVUs: 60,
      maxVUs: 150,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

const H = { headers: { Authorization: `Bearer ${USER_TOKEN}` } };

export default function () {
  const r = Math.random();
  let res;

  if (r < 0.35) {
    // customer opens "My Bookings"
    res = http.get(`${BASE_URL}/api/bookings`, H);
    check(res, { 'bookings 200': (x) => x.status === 200 && Array.isArray(x.json()) });
  } else if (r < 0.60) {
    // notification centre
    res = http.get(`${BASE_URL}/api/notifications`, H);
    check(res, { 'notifications 200': (x) => x.status === 200 && Array.isArray(x.json()) });
  } else if (r < 0.75) {
    // unread badge
    res = http.get(`${BASE_URL}/api/notifications/unread-count`, H);
    check(res, { 'unread 200': (x) => x.status === 200 && typeof x.json().count === 'number' });
  } else if (r < 0.95) {
    // public pricing (Redis-cached, no auth)
    res = http.get(`${BASE_URL}/api/admin/public/prices`);
    check(res, { 'prices 200': (x) => x.status === 200 });
  } else {
    res = http.get(`${BASE_URL}/api/admin/public/addons`);
    check(res, { 'addons 200': (x) => x.status === 200 && Array.isArray(x.json()) });
  }
  check(res, { 'no 5xx': (x) => x.status < 500 });
}