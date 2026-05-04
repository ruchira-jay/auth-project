const BASE = 'http://localhost:3001';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function register(email: string, password: string, name: string) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function createUser(data: { email: string; password: string; name: string; role: string }) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${BASE}/users/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}
