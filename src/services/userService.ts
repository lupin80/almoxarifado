import { apiRequest } from '../lib/apiClient';
import type { User } from '../types/api';

export type AppUser = User & {
  role?: 'admin' | 'operador' | 'usuario';
};

export async function listUsers(): Promise<AppUser[]> {
  return apiRequest<AppUser[]>('/users');
}

export async function createOrUpdateUser(payload: {
  id?: string;
  name: string;
  email: string;
  senha?: string;
  role: 'admin' | 'operador' | 'usuario';
}): Promise<void> {
  if (payload.id) {
    await apiRequest<void>(`/users/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        senha: payload.senha || undefined,
        role: payload.role,
      }),
    });
    return;
  }

  await apiRequest<void>(`/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      senha: payload.senha,
      role: payload.role,
    }),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiRequest<void>(`/users/${userId}`, { method: 'DELETE' });
}

export async function uploadAvatar(userId: string, file: File): Promise<{ user: AppUser }> {
  const fd = new FormData();
  fd.append('image', file);
  // backend expects email too; keeping minimal via server parsing

  return apiRequest<{ user: AppUser }>(`/users/${userId}/upload-image`, {
    method: 'POST',
    body: fd,
  });
}

