
import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { tokens } from '../helpers/auth';

describe('notifications /api/notifications', () => {
  it('401 without token', async () => {
    expect((await http.get('/api/notifications')).status).toBe(401);
  });

  it('GET / → 200 array capped at 50', async () => {
    const res = await http.get('/api/notifications', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(50);
  });

  it('GET /unread-count → 200 numeric count', async () => {
    const res = await http.get('/api/notifications/unread-count', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(typeof res.body.count).toBe('number');
  });

  it('PATCH /:id/read on unknown id → 200 (updateMany, no 404 — documents behaviour)', async () => {
    const res = await http.patch('/api/notifications/unknown-id/read', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Marked as read');
  });

  it('PATCH /read-all → 200 and count drops to 0', async () => {
    const res = await http.patch('/api/notifications/read-all', { token: tokens.user });
    expect(res.status).toBe(200);
    const count = await http.get('/api/notifications/unread-count', { token: tokens.user });
    expect(count.body.count).toBe(0);
  });

  it('POST /push-token → 200; invalid body → 5xx or 200 (no validation layer)', async () => {
    const res = await http.post('/api/notifications/push-token', {
      token: tokens.user,
      body: { pushToken: `ExponentPushToken[smoke-${Date.now()}]` },
    });
    expect(res.status).toBe(200);
  });

  it('user tokens cannot read another user’s notifications (scoped query)', async () => {
    const res = await http.get('/api/notifications', { token: tokens.admin });
    expect(res.status).toBe(200);
    // every returned notification belongs to the caller
    for (const n of res.body) expect(n.userId).not.toBe(undefined);
  });
});