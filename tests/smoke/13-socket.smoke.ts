import { describe, expect, it } from 'vitest';
import { io } from 'socket.io-client';
import { env } from '../helpers/env';
import { http } from '../helpers/http';
import { tokens } from '../helpers/auth';

function connect(): Promise<any> {
  return new Promise((resolve, reject) => {
    const s = io(env.socketUrl, { transports: ['websocket'], reconnection: false, timeout: 5000 });
    s.on('connect', () => resolve(s));
    s.on('connect_error', (e) => reject(e));
    setTimeout(() => reject(new Error('socket connect timeout')), 6000);
  });
}

describe('socket.io realtime', () => {
  it('accepts a websocket connection', async () => {
    const s = await connect();
    expect(s.connected).toBe(true);
    s.close();
  });

  it('join_admin with a forged token does not crash the server', async () => {
    const s = await connect();
    s.emit('join_admin', 'forged-token');
    await new Promise((r) => setTimeout(r, 500));
    const health = await http.get('/health');
    expect(health.status).toBe(200);
    s.close();
  });

  it('join_admin with a valid admin token keeps the server healthy', async () => {
    const s = await connect();
    s.emit('join_admin', tokens.admin);
    await new Promise((r) => setTimeout(r, 500));
    const health = await http.get('/health');
    expect(health.status).toBe(200);
    s.close();
  });

  it('unauthenticated room joins (join/join_pool) are accepted by design', async () => {
    const s = await connect();
    s.emit('join', tokens.user.replace(/\./g, '_').slice(0, 0) || 'smk-user-001');
    s.emit('join_pool');
    await new Promise((r) => setTimeout(r, 300));
    expect(s.connected).toBe(true);
    s.close();
  });
});