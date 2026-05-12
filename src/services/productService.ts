import { apiRequest } from '../lib/apiClient';

export type Product = {
  id: string;
  name: string;
  sku: string;
  category?: string;
  price?: number;
  stock?: number;
  maxStock?: number;
  location?: string;
  ncm?: string;
  icms?: number;
  ipi?: number;
  pis?: number;
  invoiceNumber?: string;
  supplierId?: string;
  image?: string;
  updatedAt?: string;
  status?: string;
};

export async function listProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/products');
}

export async function getProduct(productId: string): Promise<Product> {
  return apiRequest<Product>(`/products/${productId}`);
}

export async function listDeletedProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/products/deleted');
}

export async function createOrUpdateProduct(payload: {
  id?: string;
} & Omit<Product, 'id'>): Promise<{ id: string }> {
  if (payload.id) {
    await apiRequest<void>(`/products/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { id: payload.id };
  }

  const data = await apiRequest<{ id: string }>(`/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return data;
}

// soft delete = set status=excluido via PUT
export async function softDeleteProduct(productId: string, productBody: Partial<Product>): Promise<void> {
  await apiRequest<void>(`/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...productBody, status: 'excluido' }),
  });
}

export async function restoreProduct(productId: string, productBody: Partial<Product>): Promise<void> {
  await apiRequest<void>(`/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...productBody, status: 'ativo' }),
  });
}

export async function deletePermanentProduct(productId: string): Promise<void> {
  await apiRequest<void>(`/products/${productId}`, { method: 'DELETE' });
}

export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('image', file);

  return apiRequest<{ url: string }>(`/products/upload-image`, {
    method: 'POST',
    body: fd,
  });
}

