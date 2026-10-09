import { env } from './env';

export type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiResult<T = any> {
  status: number;
  body: T;
  headers: Headers;
}

export interface Opts {
  token?: string | null;
  body?: unknown;
  form?: FormData;
  raw?: string;
  contentType?: string;
  headers?: Record<string, string>;
}

export async function request<T = any>(
  method: Method,
  path: string,
  opts: Opts = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { ...opts.headers };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let payload: string | FormData | undefined;
  if (opts.form) payload = opts.form;
  else if (opts.raw !== undefined) {
    payload = opts.raw;
    headers['Content-Type'] = opts.contentType || 'application/json';
  } else if (opts.body !== undefined) {
    payload = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${env.baseUrl}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let body: any = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  return { status: res.status, body, headers: res.headers };
}

export const http = {
  get: (p: string, o?: Opts) => request('GET', p, o),
  post: (p: string, o?: Opts) => request('POST', p, o),
  patch: (p: string, o?: Opts) => request('PATCH', p, o),
  put: (p: string, o?: Opts) => request('PUT', p, o),
  del: (p: string, o?: Opts) => request('DELETE', p, o),
};