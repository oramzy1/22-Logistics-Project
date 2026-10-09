import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { uniq } from '../helpers/factories';

describe('public /api/public', () => {
  it('POST /contact missing fields → 400', async () => {
    const res = await http.post('/api/public/contact', { body: { name: 'Smoke' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('POST /contact with all fields → 200', async () => {
    const res = await http.post('/api/public/contact', {
      body: {
        name: 'Smoke Tester',
        email: 'smoke@example.test',
        subject: `Smoke ${uniq('c')}`,
        message: 'Automated smoke test message for the contact form.',
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Message sent successfully');
  });

  it('POST /contact returns JSON error (not HTML) on failure path', async () => {
    const res = await http.post('/api/public/contact', { body: {} });
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});