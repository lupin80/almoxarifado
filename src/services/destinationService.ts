import { apiRequest } from '../lib/apiClient';

export type Destination = {
  id: string;
  name: string;
  createdAt?: string;
};

export async function listDestinations(): Promise<Destination[]> {
  return apiRequest<Destination[]>('/destinations');
}

export async function createDestination(name: string): Promise<void> {
  await apiRequest<void>('/destinations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}
