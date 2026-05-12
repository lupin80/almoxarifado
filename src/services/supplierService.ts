import { apiRequest } from '../lib/apiClient';

export type Supplier = {
  id: string;
  name: string;
  code?: string;
  cnpj?: string;
  city?: string;
  email?: string;
  phone?: string;
  address?: string;
  updatedAt?: string;
};

export async function listSuppliers(): Promise<Supplier[]> {
  return apiRequest<Supplier[]>('/suppliers');
}

export async function createOrUpdateSupplier(payload: { id?: string } & Omit<Supplier, 'id'>): Promise<void> {
  if (payload.id) {
    await apiRequest<void>(`/suppliers/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return;
  }

  await apiRequest<void>(`/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  await apiRequest<void>(`/suppliers/${supplierId}`, { method: 'DELETE' });
}

