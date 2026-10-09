import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';

describe('system', () => {
  it('GET /health returns 200 ok payload', async () => {
    const res = await http.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeTruthy();
    expect(res.body.message).toBeTruthy();
  });

  it('unknown route returns 404', async () => {
    const res = await http.get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
  });

  it('GET /api/admin/public/prices is public and returns an object', async () => {
    const res = await http.get('/api/admin/public/prices');
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(Array.isArray(res.body)).toBe(false);
  });

  it('GET /api/admin/public/addons is public and returns an array', async () => {
    const res = await http.get('/api/admin/public/addons');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});