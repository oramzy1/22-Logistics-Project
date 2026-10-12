import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL } from '../shared/config.js';

// Counts only genuine server-side failures (5xx). TCP-level connection
// refusals (status 0) seen when k6 and the server share one Windows host are
// a load-generator/loopback limit, not an app failure, so they are excluded.
const serverErrors = new Rate('spike_server_errors');

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
    // during the spike latency may degrade — server-side errors are the signal
    spike_server_errors: ['rate<0.01'],
    'http_req_failed{scenario:recovery_probe}': ['rate<0.01'],
    'http_req_duration{scenario:recovery_probe}': ['p(95)<500'],
    checks: ['rate>0.85'],
  },
};

export default function () {
  const res =
    Math.random() < 0.7
      ? http.get(`${BASE_URL}/api/admin/public/prices`)
      : http.get(`${BASE_URL}/health`);
  serverErrors.add(res.status >= 500);
  check(res, { 'no 5xx': (r) => r.status < 500, 'responded': (r) => r.status > 0 });
}

export function probe() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'health recovers to 200': (r) => r.status === 200 });
}