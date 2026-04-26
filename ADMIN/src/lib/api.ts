const BASE = import.meta.env.VITE_API_URL ?? 'https://two2-logistics-project.onrender.com/api';

export const TOKEN_KEY = 'admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
//   const token = getToken();
//   const res = await fetch(`${BASE}${path}`, {
//     ...init,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...init.headers,
//     },
//   });
//   if (res.status === 401) {
//     clearToken();
//     window.location.href = '/login';
//   }
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message ?? 'Request failed');
//   return data;
// }

async function request<T>(path: string, init: RequestInit = {}, params?: Record<string, string>): Promise<T> {
  const token = getToken();
  const url = params
    ? `${BASE}${path}?${new URLSearchParams(params).toString()}`
    : `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data;
}


export const api = {
  get:    <T>(path: string, params?: Record<string, string>) => request<T>(path, {}, params),
  post:   <T>(path: string, body: any)  => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: any)  => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)             => request<T>(path, { method: 'DELETE' }),
};