import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../shared/config.js';

export const options = {
  scenarios: {
    health_constant_load: {
      executor: 'constant-arrival-rate',
      rate: 50,               // 50 req/s sustained
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 100,
      maxVUs: 300,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'body has ok': (r) => r.body && r.body.includes('"ok"'),
    'json content-type': (r) => (r.headers['Content-Type'] || '').includes('application/json'),
  });
}