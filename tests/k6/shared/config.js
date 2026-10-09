import { check } from 'k6';

export const BASE_URL = (__ENV.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export function requireToken(name) {
  const t = __ENV[name];
  if (!t) throw new Error(`Missing -e ${name}=... — run: npm run tokens (writes tests/.tokens.env)`);
  return t;
}

export const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` }, tags: {} });

export const jsonHeaders = { headers: { 'Content-Type': 'application/json' } };

/** Standard health check used by every scenario so a dead server fails fast. */
export function checkHealth(res) {
  return check(res, {
    'health 200': (r) => r.status === 200,
  });
}