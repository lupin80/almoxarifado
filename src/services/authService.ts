import { apiRequest } from '../lib/apiClient';
import type { User } from '../types/api';

export async function login(credentials: { username: string; password: string }): Promise<User | null> {
  const data = await apiRequest<User>('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.username, senha: credentials.password }),
  });

  // backend may return null-ish; keep behavior compatible
  return data ?? null;
}

export async function changePassword(payload: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiRequest<void>('/auth/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { email: string; newPassword: string }): Promise<void> {
  await apiRequest<void>('/auth/reset-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

