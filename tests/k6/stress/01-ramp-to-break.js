import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../shared/config.js';

/**
 * Ramp-to-break: find the knee of the curve for the two cheapest
 * endpoints (Express + Redis-cached public prices).
 * Watch p95 and error rate vs VU count in the k6 summary to locate the breaking point.
 */
export const options = {
  scenarios: {
    ramp_to_break: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 600 },
        { duration: '3m', target: 1000 },
        // { duration: '2m', target: 1500 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '1m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    // relaxed on purpose: this test exists to measure where errors begin
    http_req_failed: ['rate<0.20'],
    checks: ['rate>0.80'],
  },
};

export default function () {
  const which = Math.random();
  const res =
    which < 0.5
      ? http.get(`${BASE_URL}/health`)
      : http.get(`${BASE_URL}/api/admin/public/prices`);

  check(res, {
    'not 5xx': (r) => r.status < 500,
    'responded': (r) => r.status > 0,
  });
}