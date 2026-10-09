import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, jsonHeaders } from '../shared/config.js';

/**
 * Credential-stuffing storm against a FIXED email.
 * Expectation: express-rate-limit kicks in after 5 attempts/15min per ip:email
 * and every subsequent request must be a fast 429 — not a DB hit, not a 5xx.
 */
export const options = {
  scenarios: {
    storm: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 100,
      maxVUs: 250,
    },
    limiter_health: {
      executor: 'constant-vus',
      vus: 1,
      duration: '2m',
      exec: 'healthProbe',
    },
  },
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<400'],
    checks: ['rate>0.99'],              // every storm response is 400/404/429
    'http_req_failed{scenario:limiter_health}': ['rate<0.01'],
  },
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'storm-target@example.test', password: 'Guess!Me123' }),
    jsonHeaders,
  );
  check(res, {
    'handled by limiter or auth': (r) => [400, 404, 429].includes(r.status),
    '429 responses are fast (<300ms)': (r) => (r.status !== 429 ? true : r.timings.duration < 300),
    'no 5xx': (r) => r.status < 500,
  });
}

export function healthProbe() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'api alive during storm': (r) => r.status === 200 });
}