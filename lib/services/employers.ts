// lib/services/employers.ts
// CRUD calls for the Employer ("employee") resource.
import api from '@/lib/axios';
import { ApiResponse, Employer, PaginationMeta } from '@/lib/types';

// NOTE: axios baseURL already includes `/api` (NEXT_PUBLIC_API_URL), so paths
// here are relative to that — e.g. `/employers` → http://host/api/employers.

export interface EmployerInput {
  store: string;
  employerName: string;
  notes?: string;
  isActive?: boolean;
}

export interface ListEmployersParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function listEmployers(
  params?: ListEmployersParams
): Promise<{ data: Employer[]; meta?: PaginationMeta }> {
  const res = await api.get<ApiResponse<Employer[]>>('/employers', { params });
  return { data: res.data.data ?? [], meta: res.data.meta };
}

export async function createEmployer(input: EmployerInput): Promise<Employer> {
  const res = await api.post<ApiResponse<Employer>>('/employers', input);
  return res.data.data as Employer;
}

export async function updateEmployer(
  id: string,
  input: Partial<EmployerInput>
): Promise<Employer> {
  const res = await api.patch<ApiResponse<Employer>>(`/employers/${id}`, input);
  return res.data.data as Employer;
}

export async function deleteEmployer(id: string): Promise<void> {
  await api.delete(`/employers/${id}`);
}
