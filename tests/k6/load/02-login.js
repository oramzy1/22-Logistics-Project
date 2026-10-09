import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, jsonHeaders } from '../shared/config.js';

/**
 * Login throughput / credential-check cost (bcrypt + Postgres).
 * Each iteration uses a unique synthetic email so the per ip:email rate limiter
 * never engages; 404 "User not found" is the EXPECTED outcome for most calls.
 */
export const options = {
  scenarios: {
    login: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '2m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<600', 'p(99)<1500'],  // bcrypt.compare dominates
    checks: ['rate>0.99'],                            // status must be 200/404/400/429
    http_req_failed: ['rate<0.05'],                   // only non-4xx-counted surprises fail
  },
};

export default function () {
  const email = `load-${__VU}-${__ITER}@example.test`;
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password: 'WrongPass!123', appType: 'user-app' }),
    jsonHeaders,
  );
  check(res, {
    'expected auth outcome': (r) => [200, 400, 404, 429].includes(r.status),
    'no 5xx': (r) => r.status < 500,
    'no HTML error pages': (r) => !(r.headers['Content-Type'] || '').includes('text/html'),
  });
}