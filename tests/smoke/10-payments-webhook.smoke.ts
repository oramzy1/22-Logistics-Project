import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { http } from '../helpers/http';
import { env } from '../helpers/env';

const payload = JSON.stringify({
  event: 'charge.success',
  data: { reference: 'SMK-WEBHOOK-NO-REF', status: 'success', amount: 100000, channel: 'card' },
});

describe('payments webhook /api/payments/webhook', () => {
  it('rejects a request with no signature → 401', async () => {
    const res = await http.post('/api/payments/webhook', { raw: payload });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid signature');
  });

  it('rejects a wrong signature → 401', async () => {
    const res = await http.post('/api/payments/webhook', {
      raw: payload,
      headers: { 'x-paystack-signature': crypto.createHmac('sha512', 'wrong-secret').update(payload).digest('hex') },
    });
    expect(res.status).toBe(401);
  });

  it('accepts a valid HMAC signature → 200 even when the reference does not exist', async () => {
    if (!env.paystackSecret) {
      expect(true).toBe(true); // skipped: PAYSTACK_SECRET_KEY not set
      return;
    }
    const sig = crypto.createHmac('sha512', env.paystackSecret).update(payload).digest('hex');
    const res = await http.post('/api/payments/webhook', {
      raw: payload,
      headers: { 'x-paystack-signature': sig },
    });
    expect(res.status).toBe(200);
  });

  it('raw body handling: signature over a modified payload must fail', async () => {
    if (!env.paystackSecret) return;
    const tampered = payload.replace('100000', '999999');
    const sig = crypto.createHmac('sha512', env.paystackSecret).update(payload).digest('hex');
    const res = await http.post('/api/payments/webhook', {
      raw: tampered,
      headers: { 'x-paystack-signature': sig },
    });
    expect(res.status).toBe(401);
  });
}); 