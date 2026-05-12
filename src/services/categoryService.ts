import { apiRequest } from '../lib/apiClient';

export type Category = {
  id: string;
  name: string;
};

export async function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

export async function createOrUpdateCategory(payload: { id?: string } & { name: string }): Promise<void> {
  if (payload.id) {
    await apiRequest<void>(`/categories/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payload.name }),
    });
    return;
  }

  await apiRequest<void>(`/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: payload.name }),
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiRequest<void>(`/categories/${categoryId}`, { method: 'DELETE' });
}

