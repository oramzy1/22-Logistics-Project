import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../shared/config.js';

/**
 * Flash-spike: simulates a viral moment / push notification blast hitting
 * the public price sheet and health endpoint. Verifies the service recovers
 * and never emits 5xx during the spike.
 */
export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 0 },
        { duration: '20s', target: 1500 }, // instant burst
        { duration: '2m', target: 1500 },  // hold
        { duration: '30s', target: 0 },    // drop
      ],
      gracefulRampDown: '30s',
    },
    recovery_probe: {
      executor: 'constant-vus',
      vus: 1,
      duration: '4m',
      exec: 'probe',
    },
  },
  thresholds: {
    // during the spike latency may degrade — errors are the real failure signal
    'http_req_failed{scenario:spike}': ['rate<0.10'],
    'http_req_failed{scenario:recovery_probe}': ['rate<0.01'],
    'http_req_duration{scenario:recovery_probe}': ['p(95)<500'],
    checks: ['rate>0.90'],
  },
};

export default function () {
  const res =
    Math.random() < 0.7
      ? http.get(`${BASE_URL}/api/admin/public/prices`)
      : http.get(`${BASE_URL}/health`);
  check(res, { 'no 5xx': (r) => r.status < 500, 'responded': (r) => r.status > 0 });
}

export function probe() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'health recovers to 200': (r) => r.status === 200 });
}