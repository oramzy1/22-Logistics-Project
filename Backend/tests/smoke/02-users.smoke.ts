import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { ids, tokens } from '../helpers/auth';
import { env } from '../helpers/env';
import { form } from '../helpers/factories';

describe('users /api/users', () => {
  it('401 without token / with garbage token', async () => {
    expect((await http.get('/api/users/me')).status).toBe(401);
    expect((await http.get('/api/users/me', { token: 'not.a.jwt' })).status).toBe(401);
  });

  it('GET /me → 200 with expected shape', async () => {
    const res = await http.get('/api/users/me', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ids.user);
    expect(res.body.role).toBe('INDIVIDUAL');
    expect(res.body).not.toHaveProperty('password');
  });

  it('PATCH /profile updates name and persists', async () => {
    const res = await http.patch('/api/users/profile', { token: tokens.user, body: { name: 'Smoke User Updated' } });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Smoke User Updated');
    const me = await http.get('/api/users/me', { token: tokens.user });
    expect(me.body.name).toBe('Smoke User Updated');
    await http.patch('/api/users/profile', { token: tokens.user, body: { name: 'Smoke User' } });
  });

  it('PATCH /password with wrong current password → 400', async () => {
    const res = await http.patch('/api/users/password', {
      token: tokens.user,
      body: { currentPassword: 'Wrong!Pass999', newPassword: 'An0ther!Pass99' },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it('PATCH /email with an email that is already taken → 400', async () => {
    const res = await http.patch('/api/users/email', {
      token: tokens.user,
      body: { newEmail: 'smoke-user2@22logistics.test', password: env.smoke.password },
    });
    expect(res.status).toBe(400);
    expect(String(res.body.message).toLowerCase()).toContain('already in use');
  });

  it('POST /avatar without file → 400', async () => {
    const res = await http.post('/api/users/avatar', { token: tokens.user, form: form({}) });
    expect(res.status).toBe(400);
  });

  it('POST /push-token → 200', async () => {
    const res = await http.post('/api/users/push-token', {
      token: tokens.user,
      body: { pushToken: `ExponentPushToken[smoke-${Date.now()}]` },
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Push token saved');
  });

  it('PATCH /switch-to-business on the dedicated switch user → 200', async () => {
    const res = await http.patch('/api/users/switch-to-business', { token: tokens.userSwitch });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Business Mode enabled');
    expect(['BUSINESS', 'INDIVIDUAL']).toContain(res.body.user.role);
  });

  it('GET /:id/rating-stats for seeded driver → 200 with breakdown', async () => {
    const res = await http.get(`/api/users/${ids.driver}/rating-stats`, { token: tokens.user });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRatings');
    expect(res.body).toHaveProperty('averageRating');
    expect(Object.keys(res.body.breakdown)).toEqual(['5', '4', '3', '2', '1']);
  });

  it('GET /:id/rating-stats for unknown user → 404', async () => {
    const res = await http.get('/api/users/does-not-exist/rating-stats', { token: tokens.user });
    expect(res.status).toBe(404);
  });

  it('POST /request-action-otp for a password (email) account → 400', async () => {
    const res = await http.post('/api/users/request-action-otp', { token: tokens.user });
    expect(res.status).toBe(400);
    expect(String(res.body.message).toLowerCase()).toContain('password');
  });

  it('PATCH /deactivate with wrong credential → 4xx', async () => {
    const res = await http.patch('/api/users/deactivate', {
      token: tokens.user,
      body: { credential: 'definitely-not-my-password' },
    });
    expect([400, 403]).toContain(res.status);
  });

  it('DELETE /delete with wrong credential → 4xx', async () => {
    const res = await http.del('/api/users/delete', {
      token: tokens.user,
      body: { credential: 'definitely-not-my-password' },
    });
    expect([400, 403]).toContain(res.status);
  });
});