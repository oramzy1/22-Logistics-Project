import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { ids, tokens } from '../helpers/auth';
import { form, TINY_PNG, uniq } from '../helpers/factories';

describe('support /api/support', () => {
  it('401 without token', async () => {
    expect((await http.get('/api/support/tickets')).status).toBe(401);
  });

  it('POST /tickets without subject → 400', async () => {
    const res = await http.post('/api/support/tickets', {
      token: tokens.user,
      form: form({ description: 'no subject' }),
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  let createdId = '';

  it('POST /tickets with subject+description+screenshot → 201', async () => {
    const res = await http.post('/api/support/tickets', {
      token: tokens.user,
      form: form(
        { subject: `Smoke ticket ${uniq('t')}`, description: 'Created by smoke suite', category: 'OTHER' },
        { field: 'screenshot', filename: 'shot.png', data: TINY_PNG },
      ),
    });
    expect(res.status).toBe(201);
    expect(res.body.ticket.id).toBeTruthy();
    expect(res.body.ticket.ticketId).toMatch(/^TKT-/);
    createdId = res.body.ticket.id;
  }, 30000);

  it('GET /tickets → 200 array including created ticket', async () => {
    const res = await http.get('/api/support/tickets', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t: any) => t.id === createdId)).toBe(true);
  });

  it('GET /tickets supports status/search filters → 200', async () => {
    const res = await http.get('/api/support/tickets?status=OPEN&search=Smoke', { token: tokens.user });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /tickets/:id of another user’s ticket → 403', async () => {
    const res = await http.get(`/api/support/tickets/${ids.ticketDb}`, { token: tokens.user });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  it('GET /tickets/:id as owner → 200 with messages', async () => {
    const res = await http.get(`/api/support/tickets/${ids.ticketDb}`, { token: tokens.userOther });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ids.ticketDb);
    expect(Array.isArray(res.body.messages)).toBe(true);
  });

  it('GET /tickets/:id for unknown id → 404', async () => {
    const res = await http.get('/api/support/tickets/does-not-exist', { token: tokens.userOther });
    expect(res.status).toBe(404);
  });

  it('POST /tickets/:id/messages as owner → 200', async () => {
    const res = await http.post(`/api/support/tickets/${ids.ticketDb}/messages`, {
      token: tokens.userOther,
      body: { body: 'Smoke reply' },
    });
    expect(res.status).toBe(200);
    expect(res.body.message.body).toBe('Smoke reply');
  });

  it('POST /tickets/:id/messages as a stranger → 403', async () => {
    const res = await http.post(`/api/support/tickets/${ids.ticketDb}/messages`, {
      token: tokens.user,
      body: { body: 'intrusion attempt' },
    });
    expect(res.status).toBe(403);
  });

  it('GET /stats is admin-only → 403 for user/driver, 200 for admin', async () => {
    expect((await http.get('/api/support/stats', { token: tokens.user })).status).toBe(403);
    expect((await http.get('/api/support/stats', { token: tokens.driver })).status).toBe(403);
    const admin = await http.get('/api/support/stats', { token: tokens.admin });
    expect(admin.status).toBe(200);
    expect(admin.body).toHaveProperty('open');
    expect(admin.body).toHaveProperty('inProgress');
  });

  it('PATCH /tickets/:id status is admin-only → 403 then 200 for admin', async () => {
    const denied = await http.patch(`/api/support/tickets/${ids.ticketDb}`, {
      token: tokens.user,
      body: { status: 'IN_PROGRESS' },
    });
    expect(denied.status).toBe(403);

    const ok = await http.patch(`/api/support/tickets/${ids.ticketDb}`, {
      token: tokens.admin,
      body: { status: 'OPEN', priority: 'HIGH' },
    });
    expect(ok.status).toBe(200);
    expect(ok.body.priority).toBe('HIGH');
  });
});