import { apiRequest } from '../lib/apiClient';

export type Movement = {
  id: string;
  createdAt?: string;
  type: string;
  productId?: string;
  targetProductId?: string;
  quantity?: number;
  origin?: string;
  destination?: string;
  note?: string;
};

export async function listMovements(): Promise<Movement[]> {
  return apiRequest<Movement[]>('/movements');
}

export async function createMovement(payload: Record<string, unknown>): Promise<void> {
  await apiRequest<void>('/movements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteMovement(id: string): Promise<void> {
  await apiRequest<void>(`/movements/${id}`, {
    method: 'DELETE',
  });
}

